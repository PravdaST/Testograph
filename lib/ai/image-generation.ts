/**
 * AI Image Generation for Testograph Learn Guides
 * Gemini 2.5 Flash Image via OpenRouter
 * Generates hero + in-article images for clusters & pillars
 */

import { createClient } from '@supabase/supabase-js';

const IMAGE_MODEL = 'google/gemini-2.5-flash-image';

// Helper function to get API key (allows lazy loading after dotenv config)
function getOpenRouterApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }
  return key;
}

interface ImageGenerationOptions {
  prompt: string;
  style?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
}

interface GeneratedImage {
  url: string;
  prompt: string;
  aspectRatio: string;
}

/**
 * Generate a single image using Gemini 2.5 Flash Image
 */
export async function generateImage(
  options: ImageGenerationOptions
): Promise<GeneratedImage> {
  const { prompt, style, aspectRatio = '16:9' } = options;

  try {
    // Build enhanced prompt with NO TEXT requirement
    const noTextRequirement = 'NO TEXT, NO LETTERS, NO WORDS, NO TYPOGRAPHY on the image. Pure visual, symbolic imagery only.';
    const enhancedPrompt = style
      ? `${prompt}\n\nStyle: ${style}. ${noTextRequirement}`
      : `${prompt}\n\n${noTextRequirement}`;

    console.log(`[Image Gen] Generating ${aspectRatio} image...`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getOpenRouterApiKey()}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://testograph.eu',
        'X-Title': 'Testograph Image Generator'
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        // @ts-expect-error OpenRouter specific parameters
        modalities: ['image', 'text'],
        max_tokens: 8192
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Image Gen] API Error:', error);
      throw new Error(`OpenRouter image error ${response.status}: ${error}`);
    }

    const data = await response.json();
    console.log('[Image Gen] Response structure:', JSON.stringify(data, null, 2).substring(0, 500));

    // @ts-expect-error OpenRouter returns images array
    const images = data.choices[0]?.message?.images;

    if (!images || images.length === 0) {
      throw new Error('No image generated in response');
    }

    // Try different response formats
    const imageDataUrl = images[0]?.image_url?.url || images[0]?.url || images[0];

    if (!imageDataUrl || !imageDataUrl.startsWith('data:image')) {
      throw new Error('Invalid image data URL');
    }

    console.log(`[Image Gen] ✅ ${aspectRatio} image generated`);

    // For now, return the data URL directly
    // TODO: Upload to Supabase Storage for persistence
    return {
      url: imageDataUrl,
      prompt: enhancedPrompt,
      aspectRatio
    };

  } catch (error) {
    console.error('[Image Gen] ❌ Failed:', error);
    throw error;
  }
}

/**
 * Generate multiple images in parallel
 */
export async function generateImages(
  prompts: ImageGenerationOptions[]
): Promise<GeneratedImage[]> {
  console.log(`[Image Gen] Generating ${prompts.length} images in parallel...`);

  const promises = prompts.map(options => generateImage(options));
  const results = await Promise.allSettled(promises);

  const successfulImages = results
    .filter((r): r is PromiseFulfilledResult<GeneratedImage> => r.status === 'fulfilled')
    .map(r => r.value);

  if (successfulImages.length === 0) {
    throw new Error('Failed to generate any images');
  }

  console.log(`[Image Gen] ✅ ${successfulImages.length}/${prompts.length} images successful`);

  return successfulImages;
}

/**
 * Generate complete set of images for a learn guide (cluster or pillar)
 * Returns: Hero image + 2-4 in-article images
 */
export async function generateLearnGuideImages(
  guideTitle: string,
  guideType: 'cluster' | 'pillar',
  category: string,
  keywords: string[] = []
): Promise<{
  heroImage: GeneratedImage;
  articleImages: GeneratedImage[];
}> {
  // More images: Cluster 5 total (1 hero + 4), Pillar 7 total (1 hero + 6)
  const imageCount = guideType === 'cluster' ? 5 : 7;
  const prompts: ImageGenerationOptions[] = [];

  // Theme-specific style based on category (PHOTOREALISTIC)
  const categoryStyles: Record<string, string> = {
    testosterone: 'masculine, strength, vitality, deep greens, professional medical aesthetic, photorealistic, high-end photography',
    potency: 'masculine energy, confidence, intimate wellness, dark blues and greens, photorealistic style',
    fitness: 'athletic, muscular, gym environment, motivational, dynamic movement, professional sports photography',
    nutrition: 'healthy food, balanced diet, fresh ingredients, vibrant colors, food photography, professional kitchen',
    supplements: 'natural herbs, pills, botanical elements, scientific aesthetic, product photography',
    lifestyle: 'modern male lifestyle, wellness, relaxation, balance, lifestyle photography'
  };

  const baseStyle = categoryStyles[category] || 'professional, modern, men\'s health theme';
  const photoRealistic = 'PHOTOREALISTIC, professional DSLR photography, high quality photo, real photograph, 35mm lens, sharp focus, natural lighting';
  const noText = 'NO TEXT, NO LETTERS, NO WORDS visible on image';

  // 1. Hero Image (16:9 - for page header)
  prompts.push({
    prompt: `Professional hero banner photograph for men's health educational guide: "${guideTitle}".
Theme: ${category} (testosterone, fitness, male health).
Visual: Real photograph of strong, confident male figure representing male vitality and health.
PHOTOREALISTIC real photo, not illustration or digital art.
${noText}.`,
    style: `${baseStyle}, ${photoRealistic}, hero banner quality, cinematic lighting, professional photography, ${noText}`,
    aspectRatio: '16:9'
  });

  // 2-7. In-article Images (1:1 - square for article body)
  // More varied prompts for different H2 sections
  const articleImagePrompts = [
    {
      topic: keywords[0] || category,
      concept: 'Close-up photorealistic shot showing detail'
    },
    {
      topic: keywords[1] || 'male wellness',
      concept: 'Action-oriented dynamic scene'
    },
    {
      topic: keywords[2] || 'healthy lifestyle',
      concept: 'Professional studio composition'
    },
    {
      topic: keywords[3] || 'fitness motivation',
      concept: 'Environmental portrait in natural setting'
    },
    {
      topic: keywords[4] || 'strength training',
      concept: 'Dramatic lighting emphasizing form'
    },
    {
      topic: keywords[5] || 'wellness routine',
      concept: 'Lifestyle photography candid moment'
    }
  ];

  for (let i = 0; i < imageCount - 1; i++) {
    const imgPrompt = articleImagePrompts[i % articleImagePrompts.length];
    prompts.push({
      prompt: `In-article supporting photograph for "${guideTitle}" guide.
Focus: ${imgPrompt.topic}.
Visual approach: ${imgPrompt.concept}.
Theme: Men's health, ${category}.
PHOTOREALISTIC real photograph, not illustration or digital art.
${noText}.`,
      style: `${baseStyle}, ${photoRealistic}, editorial quality, professional photography, magazine quality, ${noText}`,
      aspectRatio: '1:1'
    });
  }

  console.log(`[Learn Guide Images] Generating ${prompts.length} images for ${guideType}: "${guideTitle}"`);

  // Generate all images in parallel
  const allImages = await generateImages(prompts);

  // Separate hero from article images
  const heroImage = allImages[0];
  const articleImages = allImages.slice(1);

  console.log(`[Learn Guide Images] ✅ Hero + ${articleImages.length} article images ready`);

  return {
    heroImage,
    articleImages
  };
}

/**
 * Convert base64 data URL to Buffer for Supabase upload
 */
export function dataUrlToBuffer(dataUrl: string): {
  buffer: Buffer;
  contentType: string;
  extension: string;
} {
  const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid data URL format');
  }

  const [, format, base64Data] = matches;
  const buffer = Buffer.from(base64Data, 'base64');
  const contentType = `image/${format}`;
  const extension = format;

  return { buffer, contentType, extension };
}

/**
 * Upload image data URL to Supabase Storage
 * Returns public URL
 *
 * NOTE: This function uses service role key to bypass RLS
 */
export async function uploadImageToSupabase(
  dataUrl: string,
  filename: string
): Promise<string> {
  // Use service role key to bypass RLS policies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { buffer, contentType, extension } = dataUrlToBuffer(dataUrl);

  const fullFilename = `${filename}.${extension}`;
  const storagePath = `learn-guides/${fullFilename}`;

  console.log(`[Supabase Upload] Uploading ${storagePath}...`);

  // Upload to blog-images bucket
  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(storagePath, buffer, {
      contentType,
      upsert: true
    });

  if (error) {
    console.error('[Supabase Upload] ❌ Failed:', error);
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('blog-images')
    .getPublicUrl(storagePath);

  console.log(`[Supabase Upload] ✅ Uploaded: ${publicUrl}`);

  return publicUrl;
}

/**
 * Transliterate Bulgarian Cyrillic to Latin for filenames
 */
function transliterateCyrillic(text: string): string {
  const cyrillicToLatin: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
    'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y',
    'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ж': 'Zh',
    'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
    'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F',
    'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sht', 'Ъ': 'A', 'Ь': 'Y',
    'Ю': 'Yu', 'Я': 'Ya'
  };

  return text.split('').map(char => cyrillicToLatin[char] || char).join('');
}

/**
 * Generate images and upload to Supabase
 * Returns public URLs instead of data URLs
 *
 * NOTE: This function requires Next.js server context
 * For standalone scripts, use generateLearnGuideImages + manual upload
 */
export async function generateAndUploadGuideImages(
  guideTitle: string,
  guideType: 'cluster' | 'pillar',
  category: string,
  keywords: string[] = []
): Promise<{
  heroImageUrl: string;
  articleImageUrls: string[];
}> {
  // Generate all images
  const { heroImage, articleImages } = await generateLearnGuideImages(
    guideTitle,
    guideType,
    category,
    keywords
  );

  // Upload hero image with proper Cyrillic transliteration
  const timestamp = Date.now();
  const transliteratedTitle = transliterateCyrillic(guideTitle);
  const slugBase = transliteratedTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50);

  const heroImageUrl = await uploadImageToSupabase(
    heroImage.url,
    `${slugBase}-hero-${timestamp}`
  );

  // Upload article images in parallel
  const articleUploadPromises = articleImages.map((img, idx) =>
    uploadImageToSupabase(img.url, `${slugBase}-article-${idx + 1}-${timestamp}`)
  );

  const articleImageUrls = await Promise.all(articleUploadPromises);

  console.log(`[Guide Images] ✅ All images uploaded to Supabase`);
  console.log(`  - Hero: ${heroImageUrl}`);
  console.log(`  - Article: ${articleImageUrls.length} images`);

  return {
    heroImageUrl,
    articleImageUrls
  };
}
