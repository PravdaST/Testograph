/**
 * Generate realistic images for Learn Guide
 * 1 Hero (16:9) + 3 Article images (1:1)
 */

// Load environment variables FIRST, before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  generateLearnGuideImages,
  dataUrlToBuffer
} from '../lib/ai/image-generation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload image to Supabase Storage (script version)
 */
async function uploadImageToSupabase(
  supabase: SupabaseClient,
  dataUrl: string,
  filename: string
): Promise<string> {
  const { buffer, contentType, extension } = dataUrlToBuffer(dataUrl);
  const fullFilename = `${filename}.${extension}`;
  const storagePath = `learn-guides/${fullFilename}`;

  console.log(`[Upload] Uploading ${storagePath}...`);

  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(storagePath, buffer, {
      contentType,
      upsert: true
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('blog-images')
    .getPublicUrl(storagePath);

  console.log(`[Upload] ✅ ${publicUrl}`);
  return publicUrl;
}

/**
 * Transliterate Cyrillic to Latin
 */
function transliterateCyrillic(text: string): string {
  const map: Record<string, string> = {
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
  return text.split('').map(c => map[c] || c).join('');
}

async function main() {
  try {
    console.log('🔍 Fetching latest guide...');

    // Get the latest guide from blog_posts table
    const { data: guide, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, guide_category, guide_type, featured_image_url, article_images')
      .eq('category', 'learn-guide')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !guide) {
      console.error('❌ Failed to fetch guide:', error);
      process.exit(1);
    }

    console.log('\n📄 Guide Details:');
    console.log(`  - Title: ${guide.title}`);
    console.log(`  - Slug: ${guide.slug}`);
    console.log(`  - Category: ${guide.guide_category}`);
    console.log(`  - Type: ${guide.guide_type}`);

    console.log('\n🎨 Generating images...');
    console.log('  - 1x Hero image (16:9) - realistic, professional, masculine');
    console.log('  - 3x Article images (1:1) - realistic, on-brand style');

    // Generate images (data URLs)
    const { heroImage, articleImages } = await generateLearnGuideImages(
      guide.title,
      guide.guide_type,
      guide.guide_category,
      ['testosterone', 'male health', 'vitality', 'strength', 'wellness']
    );

    // Upload hero image
    const timestamp = Date.now();
    const transliteratedTitle = transliterateCyrillic(guide.title);
    const slugBase = transliteratedTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);

    const heroImageUrl = await uploadImageToSupabase(
      supabase,
      heroImage.url,
      `${slugBase}-hero-${timestamp}`
    );

    // Upload article images in parallel
    const articleImageUrls = await Promise.all(
      articleImages.map((img, idx) =>
        uploadImageToSupabase(supabase, img.url, `${slugBase}-article-${idx + 1}-${timestamp}`)
      )
    );

    console.log('\n✅ Images generated and uploaded:');
    console.log(`  - Hero: ${heroImageUrl}`);
    articleImageUrls.forEach((url, idx) => {
      console.log(`  - Article ${idx + 1}: ${url}`);
    });

    // Update guide with new images
    console.log('\n📝 Updating guide with new images...');
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({
        featured_image_url: heroImageUrl,
        article_images: articleImageUrls
      })
      .eq('id', guide.id);

    if (updateError) {
      console.error('❌ Failed to update guide:', updateError);
      process.exit(1);
    }

    console.log('✅ Guide updated successfully!');
    console.log(`\n🌐 View at: https://testograph.eu/learn/${guide.guide_category}/${guide.slug}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
