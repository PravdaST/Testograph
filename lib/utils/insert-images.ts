/**
 * Insert images into HTML content at strategic positions
 * For learn guides (clusters & pillars)
 */

interface InsertImagesOptions {
  content: string;
  imageUrls: string[];
  imageAlts?: string[];
}

interface InternalLinkOptions {
  content: string;
  relatedGuides: Array<{
    title: string;
    slug: string;
    category: string;
    keywords: string[];
  }>;
  currentSlug: string;
  maxLinks?: number;
}

/**
 * Insert images into HTML content AFTER each H2 section
 * Places image immediately after the H2 heading for visual impact
 */
export function insertImagesIntoContent({
  content,
  imageUrls,
  imageAlts = []
}: InsertImagesOptions): string {
  if (!imageUrls || imageUrls.length === 0) {
    return content;
  }

  // Check if images are already embedded in content
  // If content already has <figure> or <img> tags, assume images are already inserted
  if (content.includes('<figure') || content.includes('<img')) {
    return content;
  }

  // Find all H2 tags and their positions
  const h2Regex = /(<h2[^>]*>.*?<\/h2>)/g;
  const h2Matches = [...content.matchAll(h2Regex)];

  if (h2Matches.length === 0) {
    // No H2 sections, fall back to paragraph-based insertion
    return insertByParagraphs(content, imageUrls, imageAlts);
  }

  // Skip special sections for image insertion (FAQ, disclaimer, references)
  const skipSections = ['faq', 'disclaimer', 'references', 'warning', 'tldr'];

  // Filter H2s that are good for images (not in special sections)
  const validH2Positions: number[] = [];
  h2Matches.forEach((match, index) => {
    const h2Text = match[0].toLowerCase();
    const isSpecialSection = skipSections.some(skip => h2Text.includes(skip));
    if (!isSpecialSection && match.index !== undefined) {
      validH2Positions.push(match.index + match[0].length);
    }
  });

  if (validH2Positions.length === 0) {
    return insertByParagraphs(content, imageUrls, imageAlts);
  }

  // Distribute images evenly across valid H2 positions
  const imagesToInsert = Math.min(imageUrls.length, validH2Positions.length);
  const interval = Math.max(1, Math.floor(validH2Positions.length / imagesToInsert));

  // Select positions for images (every Nth valid H2, starting from first)
  const insertPositions: { position: number; imageIndex: number }[] = [];
  let imageIndex = 0;

  for (let i = 0; i < validH2Positions.length && imageIndex < imagesToInsert; i++) {
    if (i % interval === 0 || (imageIndex < imagesToInsert && i === validH2Positions.length - 1)) {
      insertPositions.push({
        position: validH2Positions[i],
        imageIndex: imageIndex
      });
      imageIndex++;
    }
  }

  // Sort by position descending to insert from end to start (avoid offset issues)
  insertPositions.sort((a, b) => b.position - a.position);

  // Build result by inserting images at positions
  let result = content;
  for (const { position, imageIndex: imgIdx } of insertPositions) {
    const imageHtml = createImageHtml(
      imageUrls[imgIdx],
      imageAlts[imgIdx] || `Article illustration ${imgIdx + 1}`
    );
    result = result.slice(0, position) + imageHtml + result.slice(position);
  }

  return result;
}

/**
 * Fallback: Insert images after every N paragraphs
 */
function insertByParagraphs(
  content: string,
  imageUrls: string[],
  imageAlts: string[]
): string {
  const paragraphs = content.split(/(<p[^>]*>.*?<\/p>)/s);
  const paragraphCount = paragraphs.filter(p => p.trim().startsWith('<p')).length;

  if (paragraphCount < imageUrls.length * 2) {
    // Not enough paragraphs, insert more sparingly
    return content;
  }

  const interval = Math.floor(paragraphCount / (imageUrls.length + 1));
  let imageIndex = 0;
  let paragraphIndex = 0;
  const result: string[] = [];

  for (const chunk of paragraphs) {
    result.push(chunk);

    if (chunk.trim().startsWith('<p')) {
      paragraphIndex++;

      if (
        paragraphIndex % interval === 0 &&
        imageIndex < imageUrls.length &&
        paragraphIndex < paragraphCount - 1
      ) {
        const imageHtml = createImageHtml(
          imageUrls[imageIndex],
          imageAlts[imageIndex] || `Article illustration ${imageIndex + 1}`
        );
        result.push(imageHtml);
        imageIndex++;
      }
    }
  }

  return result.join('');
}

/**
 * Create responsive image HTML with proper styling
 */
function createImageHtml(url: string, alt: string): string {
  return `
<figure class="article-image my-8">
  <img
    src="${url}"
    alt="${alt}"
    class="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
    loading="lazy"
  />
</figure>
`;
}

/**
 * Count words in HTML content (strip tags first)
 */
export function countWords(htmlContent: string): number {
  const textOnly = htmlContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
    .replace(/<[^>]+>/g, ' ') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  const words = textOnly.split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

/**
 * Calculate estimated reading time in minutes
 * Average reading speed: 200 words per minute
 */
export function calculateReadingTime(htmlContent: string): number {
  const wordCount = countWords(htmlContent);
  const readingTime = Math.ceil(wordCount / 200);
  return readingTime;
}

/**
 * Extract excerpt from TLDR section or first paragraph
 */
export function extractExcerpt(htmlContent: string, maxLength = 200): string {
  // Try TLDR section first
  const tldrMatch = htmlContent.match(/<div class="tldr-section">(.*?)<\/div>/s);
  if (tldrMatch) {
    const tldrText = tldrMatch[1]
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return tldrText.substring(0, maxLength);
  }

  // Fallback to first paragraph
  const firstPMatch = htmlContent.match(/<p[^>]*>(.*?)<\/p>/s);
  if (firstPMatch) {
    const firstPText = firstPMatch[1]
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return firstPText.substring(0, maxLength);
  }

  return '';
}

/**
 * Insert internal links to related guides based on keywords
 * Automatically links first occurrence of keywords to related articles
 * SEO-friendly internal linking strategy
 */
/**
 * Link product mentions (TestoUP) to shop page
 * Links first N occurrences of "TestoUP" to the product page
 */
export function linkProductMentions(
  content: string,
  maxLinks: number = 3
): string {
  const productUrl = 'https://shop.testograph.eu/products/testoup';
  const productName = 'TestoUP';

  // Don't link if already contains links to the product
  if (content.includes(productUrl)) {
    return content;
  }

  // Match "TestoUP" (case insensitive) but not inside existing links or tags
  // Use a more careful approach to avoid breaking HTML
  let linksAdded = 0;

  // Split by HTML tags to process only text content
  const parts = content.split(/(<[^>]+>)/);

  const processedParts = parts.map(part => {
    // Skip if it's an HTML tag or we've added enough links
    if (part.startsWith('<') || linksAdded >= maxLinks) {
      return part;
    }

    // Skip if inside an anchor tag (check previous parts)
    const previousContent = parts.slice(0, parts.indexOf(part)).join('');
    const openAnchors = (previousContent.match(/<a[^>]*>/gi) || []).length;
    const closeAnchors = (previousContent.match(/<\/a>/gi) || []).length;
    if (openAnchors > closeAnchors) {
      return part; // We're inside an anchor tag
    }

    // Replace TestoUP with link (case insensitive, preserving original case)
    const regex = /\b(TestoUP|TESTOUP|Testoup|testoup)\b/g;

    return part.replace(regex, (match) => {
      if (linksAdded >= maxLinks) {
        return match;
      }
      linksAdded++;
      return `<a href="${productUrl}" target="_blank" rel="noopener noreferrer" class="text-brand-green hover:text-brand-green/80 font-semibold transition-colors">${match}</a>`;
    });
  });

  return processedParts.join('');
}

export function insertInternalLinks({
  content,
  relatedGuides,
  currentSlug,
  maxLinks = 5
}: InternalLinkOptions): string {
  if (!relatedGuides || relatedGuides.length === 0) {
    return content;
  }

  // Filter out current guide
  const guides = relatedGuides.filter(g => g.slug !== currentSlug);
  if (guides.length === 0) {
    return content;
  }

  // Build keyword → guide mapping (prioritize longer keywords)
  const keywordMap: Array<{
    keyword: string;
    url: string;
    title: string;
  }> = [];

  for (const guide of guides) {
    const url = `/learn/${guide.category}/${guide.slug}`;

    // Add guide title as a keyword
    keywordMap.push({
      keyword: guide.title.toLowerCase(),
      url,
      title: guide.title
    });

    // Add all keywords
    if (guide.keywords && guide.keywords.length > 0) {
      for (const keyword of guide.keywords) {
        if (keyword && keyword.trim().length > 2) {
          keywordMap.push({
            keyword: keyword.toLowerCase().trim(),
            url,
            title: guide.title
          });
        }
      }
    }
  }

  // Sort by keyword length (longer first for better matching)
  keywordMap.sort((a, b) => b.keyword.length - a.keyword.length);

  // Track linked keywords to avoid duplicates
  const linkedKeywords = new Set<string>();
  let linksAdded = 0;

  // Process content paragraph by paragraph
  const paragraphs = content.split(/(<p[^>]*>.*?<\/p>)/s);

  const processedParagraphs = paragraphs.map(para => {
    // Skip if not a paragraph or already has max links
    if (!para.startsWith('<p') || linksAdded >= maxLinks) {
      return para;
    }

    // Extract paragraph content
    const pMatch = para.match(/<p([^>]*)>(.*?)<\/p>/s);
    if (!pMatch) return para;

    const [, pAttrs, pContent] = pMatch;
    let processedContent = pContent;

    // Try to link keywords in this paragraph
    for (const { keyword, url, title } of keywordMap) {
      // Stop if max links reached
      if (linksAdded >= maxLinks) break;

      // Skip if already linked
      if (linkedKeywords.has(keyword)) continue;

      // Create case-insensitive regex (match whole words only)
      const regex = new RegExp(
        `\\b(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`,
        'i'
      );

      // Check if keyword exists in content
      const match = processedContent.match(regex);
      if (match && match[0]) {
        // Replace ONLY first occurrence with link
        const replacement = `<a href="${url}" class="internal-link" title="${title}">${match[0]}</a>`;
        processedContent = processedContent.replace(regex, replacement);

        linkedKeywords.add(keyword);
        linksAdded++;
        break; // Only one link per paragraph
      }
    }

    return `<p${pAttrs}>${processedContent}</p>`;
  });

  return processedParagraphs.join('');
}
