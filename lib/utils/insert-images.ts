/**
 * Insert images into HTML content at strategic positions
 * For learn guides (clusters & pillars)
 */

interface InsertImagesOptions {
  content: string;
  imageUrls: string[];
  imageAlts?: string[];
}

/**
 * Insert images into HTML content after every N paragraphs
 * Ensures even distribution throughout the article
 */
export function insertImagesIntoContent({
  content,
  imageUrls,
  imageAlts = []
}: InsertImagesOptions): string {
  if (!imageUrls || imageUrls.length === 0) {
    return content;
  }

  // Split content into sections (by <h2> tags)
  const h2Sections = content.split(/(<h2[^>]*>.*?<\/h2>)/);

  if (h2Sections.length <= 1) {
    // No H2 sections, fall back to paragraph-based insertion
    return insertByParagraphs(content, imageUrls, imageAlts);
  }

  // Insert images between H2 sections
  const sectionsToInsert = Math.min(imageUrls.length, h2Sections.length - 2);
  const sectionInterval = Math.floor((h2Sections.length - 1) / (sectionsToInsert + 1));

  let imageIndex = 0;
  const result: string[] = [];

  for (let i = 0; i < h2Sections.length; i++) {
    result.push(h2Sections[i]);

    // Insert image after every Nth section
    if (
      i > 0 &&
      i % sectionInterval === 0 &&
      imageIndex < imageUrls.length &&
      i < h2Sections.length - 1
    ) {
      const imageHtml = createImageHtml(
        imageUrls[imageIndex],
        imageAlts[imageIndex] || `Article illustration ${imageIndex + 1}`
      );
      result.push(imageHtml);
      imageIndex++;
    }
  }

  return result.join('');
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
