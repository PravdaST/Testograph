/**
 * Regenerate images for an existing article
 * Usage: node scripts/regenerate-article-images.mjs
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
dotenv.config({ path: '.env.local' });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const IMAGE_MODEL = 'google/gemini-2.5-flash-image';

// Article to regenerate
const ARTICLE_ID = '6874dd57-ddcf-4422-806d-b6a87bf48213';

async function generateImage(prompt, style, aspectRatio = '16:9') {
  const noTextRequirement = 'NO TEXT, NO LETTERS, NO WORDS, NO TYPOGRAPHY on the image. Pure visual, symbolic imagery only.';
  const enhancedPrompt = style
    ? `${prompt}\n\nStyle: ${style}. ${noTextRequirement}`
    : `${prompt}\n\n${noTextRequirement}`;

  console.log(`[Image Gen] Generating ${aspectRatio} image...`);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://testograph.eu',
      'X-Title': 'Testograph Image Generator'
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      messages: [{ role: 'user', content: enhancedPrompt }],
      modalities: ['image', 'text'],
      max_tokens: 8192
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter image error ${response.status}: ${error}`);
  }

  const data = await response.json();
  const images = data.choices[0]?.message?.images;

  if (!images || images.length === 0) {
    throw new Error('No image generated in response');
  }

  const imageDataUrl = images[0]?.image_url?.url || images[0]?.url || images[0];

  if (!imageDataUrl || !imageDataUrl.startsWith('data:image')) {
    throw new Error('Invalid image data URL');
  }

  console.log(`[Image Gen] Generated ${aspectRatio} image`);
  return imageDataUrl;
}

function dataUrlToBuffer(dataUrl) {
  const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid data URL format');

  const [, format, base64Data] = matches;
  const buffer = Buffer.from(base64Data, 'base64');
  return { buffer, contentType: `image/${format}`, extension: format };
}

async function uploadToSupabase(supabase, dataUrl, filename) {
  const { buffer, contentType, extension } = dataUrlToBuffer(dataUrl);
  const fullFilename = `${filename}.${extension}`;
  const storagePath = `learn-guides/${fullFilename}`;

  console.log(`[Upload] Uploading ${storagePath}...`);

  const { error } = await supabase.storage
    .from('blog-images')
    .upload(storagePath, buffer, { contentType, upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from('blog-images')
    .getPublicUrl(storagePath);

  console.log(`[Upload] Done: ${publicUrl}`);
  return publicUrl;
}

function insertImagesIntoContent(content, imageUrls, imageAlts = []) {
  if (!imageUrls || imageUrls.length === 0) return content;

  // REMOVE existing article images first (for regeneration)
  let cleanContent = content;
  if (content.includes('<figure class="article-image"')) {
    console.log('[Insert] Removing existing article images...');
    cleanContent = content.replace(/<figure class="article-image[^"]*"[^>]*>[\s\S]*?<\/figure>/g, '');
    console.log('[Insert] Existing images removed');
  }
  content = cleanContent;

  // Find all H2 tags
  const h2Regex = /(<h2[^>]*>.*?<\/h2>)/g;
  const h2Matches = [...content.matchAll(h2Regex)];

  if (h2Matches.length === 0) {
    console.log('[Insert] No H2 tags found');
    return content;
  }

  // Skip special sections
  const skipSections = ['faq', 'disclaimer', 'references', 'warning', 'tldr', 'често задавани', 'източници', 'отказ от отговорност'];

  const validH2Positions = [];
  h2Matches.forEach((match) => {
    const h2Text = match[0].toLowerCase();
    const isSpecialSection = skipSections.some(skip => h2Text.includes(skip));
    if (!isSpecialSection && match.index !== undefined) {
      validH2Positions.push(match.index + match[0].length);
    }
  });

  console.log(`[Insert] Found ${validH2Positions.length} valid H2 positions for images`);

  if (validH2Positions.length === 0) return content;

  // Insert image after H2 sections (NO cycling - only as many as we have)
  const insertPositions = [];
  const maxImages = Math.min(validH2Positions.length, imageUrls.length);
  for (let i = 0; i < maxImages; i++) {
    insertPositions.push({ position: validH2Positions[i], imageIndex: i });
  }

  // Sort descending to insert from end
  insertPositions.sort((a, b) => b.position - a.position);

  let result = content;
  for (const { position, imageIndex } of insertPositions) {
    const imageHtml = `
<figure class="article-image my-8">
  <img
    src="${imageUrls[imageIndex]}"
    alt="${imageAlts[imageIndex] || `Article illustration ${imageIndex + 1}`}"
    class="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
    loading="lazy"
  />
</figure>
`;
    result = result.slice(0, position) + imageHtml + result.slice(position);
  }

  return result;
}

async function main() {
  console.log('=== Regenerating Article Images ===\n');

  if (!OPENROUTER_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing environment variables!');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // 1. Get article
  console.log('[DB] Fetching article...');
  const { data: article, error: fetchError } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', ARTICLE_ID)
    .single();

  if (fetchError || !article) {
    console.error('Article not found:', fetchError);
    process.exit(1);
  }

  console.log(`[DB] Found: "${article.title}"`);
  console.log(`[DB] Category: ${article.guide_category}`);
  console.log(`[DB] Type: ${article.guide_type}`);

  // 2. Generate images (pillar = 7: 1 hero + 6 in-article)
  const imageCount = article.guide_type === 'pillar' ? 7 : 5;
  const category = article.guide_category || 'lifestyle';

  const baseStyle = 'masculine, strength, vitality, deep greens, professional medical aesthetic, photorealistic, high-end photography';
  const photoRealistic = 'PHOTOREALISTIC, professional DSLR photography, high quality photo, real photograph, 35mm lens, sharp focus, natural lighting';
  const noText = 'NO TEXT, NO LETTERS, NO WORDS visible on image';

  const prompts = [];

  // Hero image
  prompts.push({
    prompt: `Professional hero banner photograph for men's health educational guide: "${article.title}".
Theme: ${category} (stress management, male health, wellness).
Visual: Real photograph of calm, confident male figure representing relaxation and mental wellness.
PHOTOREALISTIC real photo, not illustration or digital art.
${noText}.`,
    style: `${baseStyle}, ${photoRealistic}, hero banner quality, cinematic lighting, ${noText}`,
    aspectRatio: '16:9'
  });

  // In-article images
  const articlePrompts = [
    { topic: 'stress management', concept: 'Man practicing deep breathing or meditation' },
    { topic: 'cortisol and testosterone', concept: 'Athletic man in calm, confident pose' },
    { topic: 'healthy lifestyle', concept: 'Professional studio shot of wellness routine' },
    { topic: 'fitness and recovery', concept: 'Man doing yoga or stretching exercises' },
    { topic: 'quality sleep', concept: 'Peaceful bedroom environment or restful scene' },
    { topic: 'mental wellness', concept: 'Man in nature, forest bathing or outdoor relaxation' }
  ];

  for (let i = 0; i < imageCount - 1; i++) {
    const p = articlePrompts[i % articlePrompts.length];
    prompts.push({
      prompt: `In-article photograph for "${article.title}" guide.
Focus: ${p.topic}.
Visual: ${p.concept}.
Theme: Men's health, stress management, wellness.
PHOTOREALISTIC real photograph, not illustration.
${noText}.`,
      style: `${baseStyle}, ${photoRealistic}, editorial quality, ${noText}`,
      aspectRatio: '1:1'
    });
  }

  console.log(`\n[Images] Generating ${prompts.length} images...\n`);

  const generatedImages = [];
  for (let i = 0; i < prompts.length; i++) {
    const p = prompts[i];
    try {
      console.log(`[${i + 1}/${prompts.length}] Generating...`);
      const dataUrl = await generateImage(p.prompt, p.style, p.aspectRatio);
      generatedImages.push(dataUrl);
      console.log(`[${i + 1}/${prompts.length}] Done`);
    } catch (err) {
      console.error(`[${i + 1}/${prompts.length}] Failed:`, err.message);
    }
  }

  if (generatedImages.length === 0) {
    console.error('No images generated!');
    process.exit(1);
  }

  console.log(`\n[Images] Generated ${generatedImages.length} images\n`);

  // 3. Upload to Supabase
  const timestamp = Date.now();
  const slugBase = article.slug.substring(0, 40);

  console.log('[Upload] Uploading images to Supabase...\n');

  const uploadedUrls = [];
  for (let i = 0; i < generatedImages.length; i++) {
    const suffix = i === 0 ? 'hero' : `article-${i}`;
    const filename = `${slugBase}-${suffix}-${timestamp}`;
    try {
      const url = await uploadToSupabase(supabase, generatedImages[i], filename);
      uploadedUrls.push(url);
    } catch (err) {
      console.error(`Upload ${i} failed:`, err.message);
    }
  }

  if (uploadedUrls.length === 0) {
    console.error('No images uploaded!');
    process.exit(1);
  }

  const heroImageUrl = uploadedUrls[0];
  const articleImageUrls = uploadedUrls.slice(1);

  console.log(`\n[Upload] Hero: ${heroImageUrl}`);
  console.log(`[Upload] Article images: ${articleImageUrls.length}\n`);

  // 4. Insert images into content
  console.log('[Content] Inserting images into HTML...');
  const updatedContent = insertImagesIntoContent(
    article.content,
    articleImageUrls,
    articleImageUrls.map((_, i) => `${article.title} - илюстрация ${i + 1}`)
  );

  // 5. Update database
  console.log('[DB] Updating article...');
  const { error: updateError } = await supabase
    .from('blog_posts')
    .update({
      content: updatedContent,
      featured_image_url: heroImageUrl,
      article_images: articleImageUrls,
      updated_at: new Date().toISOString()
    })
    .eq('id', ARTICLE_ID);

  if (updateError) {
    console.error('Update failed:', updateError);
    process.exit(1);
  }

  console.log('\n=== SUCCESS ===');
  console.log(`Article "${article.title}" updated with ${1 + articleImageUrls.length} images!`);
  console.log(`\nView at: http://localhost:3006/learn/${article.guide_category}/${article.slug}`);
}

main().catch(console.error);
