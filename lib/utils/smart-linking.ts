/**
 * Smart Internal Linking Engine
 * Automatically inserts internal links to related guides within content
 */

interface Guide {
  id: string;
  slug: string;
  title: string;
  guide_category: string;
  guide_type: 'cluster' | 'pillar';
  parent_cluster_slug?: string;
  suggested_pillars?: string[];
}

interface LinkablePhrase {
  phrase: string;
  targetSlug: string;
  targetCategory: string;
  priority: number; // Higher = more important
}

/**
 * Extract linkable phrases from a guide
 * Returns variations of title that can be matched in content
 */
function extractLinkablePhrases(guide: Guide): LinkablePhrase[] {
  const phrases: LinkablePhrase[] = [];
  const title = guide.title;

  // Priority 1: Exact title match
  phrases.push({
    phrase: title,
    targetSlug: guide.slug,
    targetCategory: guide.guide_category,
    priority: 10,
  });

  // Priority 2: Title without common prefixes/suffixes
  const cleanTitle = title
    .replace(/^(как да|как|защо|какво е|какви са|кога|къде)\s+/gi, '')
    .replace(/\s+(пълен гид|пълно ръководство|ръководство|гид|статия)$/gi, '')
    .trim();

  if (cleanTitle !== title && cleanTitle.length > 10) {
    phrases.push({
      phrase: cleanTitle,
      targetSlug: guide.slug,
      targetCategory: guide.guide_category,
      priority: 8,
    });
  }

  // Priority 3: Key phrases from title (words with 5+ chars)
  const words = title.split(/\s+/).filter((w) => w.length >= 5);
  if (words.length >= 2) {
    const keyPhrase = words.slice(0, 3).join(' ');
    if (keyPhrase.length > 10 && keyPhrase !== title && keyPhrase !== cleanTitle) {
      phrases.push({
        phrase: keyPhrase,
        targetSlug: guide.slug,
        targetCategory: guide.guide_category,
        priority: 5,
      });
    }
  }

  return phrases;
}

/**
 * Find all potential link opportunities in content
 * Uses regex-based approach (no DOM parsing needed)
 */
function findLinkOpportunities(
  content: string,
  linkablePhrases: LinkablePhrase[],
  currentGuideSlug: string
): Array<{ phrase: string; targetSlug: string; targetCategory: string; position: number }> {
  const opportunities: Array<{
    phrase: string;
    targetSlug: string;
    targetCategory: string;
    position: number;
  }> = [];

  // Extract existing linked phrases to avoid duplicates
  const existingLinksRegex = /<a[^>]*>([^<]+)<\/a>/gi;
  const existingLinkedPhrases = new Set<string>();
  let linkMatch;
  while ((linkMatch = existingLinksRegex.exec(content)) !== null) {
    existingLinkedPhrases.add(linkMatch[1].toLowerCase().trim());
  }

  // Sort phrases by priority (highest first)
  const sortedPhrases = [...linkablePhrases].sort((a, b) => b.priority - a.priority);

  // Track which phrases we've already linked (only link first occurrence)
  const linkedPhrases = new Set<string>(existingLinkedPhrases);

  // Strip HTML tags for plain text search
  const plainText = content.replace(/<[^>]+>/g, ' ');

  for (const linkable of sortedPhrases) {
    const phraseKey = linkable.phrase.toLowerCase().trim();

    // Skip if already linked or if it's the current guide
    if (linkedPhrases.has(phraseKey) || linkable.targetSlug === currentGuideSlug) {
      continue;
    }

    // Case-insensitive search for the phrase in plain text
    const regex = new RegExp(`\\b${escapeRegex(linkable.phrase)}\\b`, 'i');
    const match = regex.exec(plainText);

    if (match) {
      opportunities.push({
        phrase: linkable.phrase,
        targetSlug: linkable.targetSlug,
        targetCategory: linkable.targetCategory,
        position: match.index,
      });
      linkedPhrases.add(phraseKey);
    }
  }

  // Sort by position in content (link earlier mentions first)
  return opportunities.sort((a, b) => a.position - b.position);
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Insert links into HTML content
 * Only links the FIRST occurrence of each phrase
 */
function insertLinksIntoContent(
  content: string,
  opportunities: Array<{ phrase: string; targetSlug: string; targetCategory: string }>
): string {
  let updatedContent = content;

  // Track which phrases we've already linked
  const linkedPhrases = new Set<string>();

  for (const opportunity of opportunities) {
    const phraseKey = opportunity.phrase.toLowerCase().trim();

    // Skip if already linked
    if (linkedPhrases.has(phraseKey)) continue;

    const url = `/learn/${opportunity.targetCategory}/${opportunity.targetSlug}`;

    // Create regex to match FIRST occurrence not inside HTML tags
    // This regex matches the phrase only when it's in text content, not in HTML attributes
    const safeRegex = new RegExp(
      `(?<!<[^>]*)(\\b${escapeRegex(opportunity.phrase)}\\b)(?![^<]*>)`,
      'i'
    );

    // Check if phrase exists and is not already linked
    if (safeRegex.test(updatedContent) && !updatedContent.includes(`>${opportunity.phrase}</a>`)) {
      updatedContent = updatedContent.replace(
        safeRegex,
        `<a href="${url}" class="internal-link text-[#499167] hover:text-[#5fb57e] underline transition-colors">$1</a>`
      );
      linkedPhrases.add(phraseKey);
    }
  }

  return updatedContent;
}

/**
 * Main function: Add smart internal links to content
 *
 * @param currentGuide - The guide whose content we're updating
 * @param allGuides - All published guides in the system
 * @returns Updated content with internal links
 */
export function addSmartInternalLinks(currentGuide: Guide, allGuides: Guide[]): string {
  let content = currentGuide.content || '';

  // Get guides that are relevant to link to
  const relevantGuides = allGuides.filter((guide) => {
    // Don't link to self
    if (guide.slug === currentGuide.slug) return false;

    // If this is a pillar, prioritize:
    // 1. Its parent cluster
    // 2. Sibling pillars (same parent)
    if (currentGuide.guide_type === 'pillar') {
      const isParentCluster =
        guide.guide_type === 'cluster' && guide.slug === currentGuide.parent_cluster_slug;
      const isSiblingPillar =
        guide.guide_type === 'pillar' && guide.parent_cluster_slug === currentGuide.parent_cluster_slug;
      const isSameCategory = guide.guide_category === currentGuide.guide_category;

      return isParentCluster || isSiblingPillar || isSameCategory;
    }

    // If this is a cluster, prioritize:
    // 1. Its child pillars (suggested_pillars match)
    // 2. Other guides in same category
    if (currentGuide.guide_type === 'cluster') {
      const isChildPillar =
        guide.guide_type === 'pillar' && guide.parent_cluster_slug === currentGuide.slug;
      const isSameCategory = guide.guide_category === currentGuide.guide_category;

      return isChildPillar || isSameCategory;
    }

    return false;
  });

  // Extract linkable phrases from relevant guides
  const allLinkablePhrases: LinkablePhrase[] = [];
  for (const guide of relevantGuides) {
    const phrases = extractLinkablePhrases(guide);
    allLinkablePhrases.push(...phrases);
  }

  // Find link opportunities in current content
  const opportunities = findLinkOpportunities(content, allLinkablePhrases, currentGuide.slug);

  // Limit to top 10 most relevant links per article
  const topOpportunities = opportunities.slice(0, 10);

  // Insert links
  const updatedContent = insertLinksIntoContent(content, topOpportunities);

  return updatedContent;
}

/**
 * Standalone version that takes content directly
 */
export function updateContentWithLinks(
  content: string,
  currentGuideSlug: string,
  currentGuideType: 'cluster' | 'pillar',
  currentGuideCategory: string,
  parentClusterSlug: string | undefined,
  allGuides: Guide[]
): string {
  const currentGuide: Guide & { content: string } = {
    id: '',
    slug: currentGuideSlug,
    title: '',
    guide_category: currentGuideCategory,
    guide_type: currentGuideType,
    parent_cluster_slug: parentClusterSlug,
    content,
  };

  return addSmartInternalLinks(currentGuide, allGuides);
}
