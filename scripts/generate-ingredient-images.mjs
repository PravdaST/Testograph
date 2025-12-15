/**
 * Generate 12 ingredient images for TestoUP
 * Using OpenRouter Gemini 2.5 Flash Image
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const IMAGE_MODEL = 'google/gemini-2.5-flash-image';

const ingredients = [
  { id: 'ashwagandha', name: 'Ашваганда', prompt: 'Ashwagandha root and powder, natural herbal supplement, brown root pieces and golden powder on dark surface' },
  { id: 'vitamin-d3', name: 'Витамин D3', prompt: 'Vitamin D3 supplement, golden sun rays through clouds, warm sunlight representing vitamin D, yellow orange glow' },
  { id: 'zinc', name: 'Цинк', prompt: 'Zinc mineral supplement, metallic zinc pieces, oysters and pumpkin seeds rich in zinc, silver metallic texture' },
  { id: 'selenium', name: 'Селен', prompt: 'Selenium mineral, Brazil nuts and selenium-rich foods, natural selenium sources, brown earthy tones' },
  { id: 'vitamin-b12', name: 'Витамин B12', prompt: 'Vitamin B12 red supplements, energy vitamin, red crystalline structure, vibrant red color' },
  { id: 'vitamin-e', name: 'Витамин E', prompt: 'Vitamin E golden oil droplets, wheat germ and almonds, amber golden liquid, antioxidant vitamin' },
  { id: 'tribulus', name: 'Tribulus', prompt: 'Tribulus terrestris plant with spiky fruit, yellow flowers, green herbal supplement, natural testosterone booster herb' },
  { id: 'magnesium', name: 'Магнезий', prompt: 'Magnesium mineral, dark leafy greens and nuts, cyan teal colored magnesium supplement powder' },
  { id: 'vitamin-k2', name: 'Витамин K2', prompt: 'Vitamin K2 from natto fermented soybeans, green leafy vegetables, deep green and purple colors' },
  { id: 'vitamin-b6', name: 'Витамин B6', prompt: 'Vitamin B6 pyridoxine, bananas and chickpeas rich in B6, warm pink orange tones' },
  { id: 'folate-b9', name: 'Фолат B9', prompt: 'Folate vitamin B9, fresh green spinach leaves and asparagus, vibrant green healthy vegetables' },
  { id: 'vitamin-c', name: 'Витамин C', prompt: 'Vitamin C citrus fruits, fresh oranges and lemons sliced, bright yellow and orange, fresh juicy' }
];

async function generateImage(ingredient) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set');

  const fullPrompt = `Professional product photography of ${ingredient.prompt}.
Macro close-up shot, dark moody background, dramatic lighting, high-end supplement advertisement style.
PHOTOREALISTIC, professional DSLR photography, sharp focus, shallow depth of field.
NO TEXT, NO LETTERS, NO WORDS, NO LABELS on the image. Pure visual only.
Square format, centered composition.`;

  console.log(`[${ingredient.id}] Generating image...`);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://testograph.eu',
      'X-Title': 'Testograph Ingredient Images'
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      messages: [{ role: 'user', content: fullPrompt }],
      modalities: ['image', 'text'],
      max_tokens: 8192
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  const data = await response.json();
  const images = data.choices[0]?.message?.images;

  if (!images || images.length === 0) {
    throw new Error('No image generated');
  }

  const imageDataUrl = images[0]?.image_url?.url || images[0]?.url || images[0];

  if (!imageDataUrl || !imageDataUrl.startsWith('data:image')) {
    throw new Error('Invalid image data');
  }

  console.log(`[${ingredient.id}] Image generated successfully`);
  return imageDataUrl;
}

async function uploadToSupabase(dataUrl, filename) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Parse data URL
  const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid data URL');

  const [, format, base64Data] = matches;
  const buffer = Buffer.from(base64Data, 'base64');
  const contentType = `image/${format}`;
  const fullFilename = `${filename}.${format}`;
  const storagePath = `ingredients/${fullFilename}`;

  console.log(`[Upload] Uploading ${storagePath}...`);

  const { error } = await supabase.storage
    .from('blog-images')
    .upload(storagePath, buffer, {
      contentType,
      upsert: true
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from('blog-images')
    .getPublicUrl(storagePath);

  console.log(`[Upload] Done: ${publicUrl}`);
  return publicUrl;
}

async function main() {
  console.log('=== Generating 12 Ingredient Images ===\n');

  const results = [];

  for (const ingredient of ingredients) {
    try {
      // Generate image
      const dataUrl = await generateImage(ingredient);

      // Upload to Supabase
      const publicUrl = await uploadToSupabase(dataUrl, ingredient.id);

      results.push({
        id: ingredient.id,
        name: ingredient.name,
        url: publicUrl
      });

      console.log(`\n[${ingredient.id}] Done!\n`);

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`[${ingredient.id}] FAILED:`, err.message);
      results.push({
        id: ingredient.id,
        name: ingredient.name,
        error: err.message
      });
    }
  }

  console.log('\n=== RESULTS ===\n');
  console.log(JSON.stringify(results, null, 2));

  // Output code snippet for page.tsx
  console.log('\n=== CODE SNIPPET ===\n');
  console.log('const ingredientImages = {');
  for (const r of results) {
    if (r.url) {
      console.log(`  "${r.id}": "${r.url}",`);
    }
  }
  console.log('};');
}

main().catch(console.error);
