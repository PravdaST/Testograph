/**
 * Generate 4 avatar images for testimonials
 * Using OpenRouter Gemini 2.5 Flash Image
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const IMAGE_MODEL = 'google/gemini-2.5-flash-image';

const avatars = [
  {
    id: 'ivan-32',
    name: 'Иван',
    age: '32',
    prompt: `Professional headshot portrait of a Bulgarian man, 32 years old, short dark hair, light stubble beard, friendly confident smile, wearing casual dark t-shirt.
Clean studio lighting, neutral gray background, shoulders visible.
Fit and healthy appearance, natural skin texture, warm expression.
PHOTOREALISTIC, professional portrait photography, sharp focus on face.
NO TEXT, NO LETTERS, NO WORDS. Pure visual only.
Square format, centered composition, eye contact with camera.`
  },
  {
    id: 'dimitar-41',
    name: 'Димитър',
    age: '41',
    prompt: `Professional headshot portrait of a Bulgarian man, 41 years old, short brown hair with slight gray at temples, neat short beard, mature confident expression.
Clean studio lighting, neutral gray background, shoulders visible.
Business casual polo shirt, healthy athletic build, genuine warm smile.
PHOTOREALISTIC, professional portrait photography, sharp focus on face.
NO TEXT, NO LETTERS, NO WORDS. Pure visual only.
Square format, centered composition, eye contact with camera.`
  },
  {
    id: 'stoyan-38',
    name: 'Стоян',
    age: '38',
    prompt: `Professional headshot portrait of a Bulgarian man, 38 years old, dark hair medium length styled back, clean shaven, friendly approachable smile.
Clean studio lighting, neutral gray background, shoulders visible.
Wearing dark henley shirt, fit appearance, warm genuine expression.
PHOTOREALISTIC, professional portrait photography, sharp focus on face.
NO TEXT, NO LETTERS, NO WORDS. Pure visual only.
Square format, centered composition, eye contact with camera.`
  },
  {
    id: 'georgi-45',
    name: 'Георги',
    age: '45',
    prompt: `Professional headshot portrait of a Bulgarian man, 45 years old, short graying hair, distinguished look, well-groomed short beard with gray.
Clean studio lighting, neutral gray background, shoulders visible.
Wearing casual button-up shirt, mature confident smile, experienced look.
PHOTOREALISTIC, professional portrait photography, sharp focus on face.
NO TEXT, NO LETTERS, NO WORDS. Pure visual only.
Square format, centered composition, eye contact with camera.`
  }
];

async function generateImage(avatar) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set');

  console.log(`[${avatar.id}] Generating avatar for ${avatar.name}, ${avatar.age}г...`);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://testograph.eu',
      'X-Title': 'Testograph Avatar Images'
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      messages: [{ role: 'user', content: avatar.prompt }],
      modalities: ['image', 'text'],
      max_tokens: 8192
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  const data = await response.json();

  // Check for inline_data format (Gemini style)
  const content = data.choices[0]?.message?.content;

  // Try to find image in various formats
  let imageDataUrl = null;

  // Check for parts array with inline_data
  if (Array.isArray(content)) {
    for (const part of content) {
      if (part.type === 'image' && part.image_url?.url) {
        imageDataUrl = part.image_url.url;
        break;
      }
      if (part.inline_data) {
        imageDataUrl = `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`;
        break;
      }
    }
  }

  // Check message.images array
  if (!imageDataUrl && data.choices[0]?.message?.images) {
    const images = data.choices[0].message.images;
    if (images.length > 0) {
      imageDataUrl = images[0]?.image_url?.url || images[0]?.url || images[0];
    }
  }

  if (!imageDataUrl || !imageDataUrl.startsWith('data:image')) {
    console.log('Response structure:', JSON.stringify(data, null, 2).slice(0, 2000));
    throw new Error('No valid image data in response');
  }

  console.log(`[${avatar.id}] Image generated successfully`);
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
  const matches = dataUrl.match(/^data:image\/([\w+]+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid data URL');

  const [, format, base64Data] = matches;
  const buffer = Buffer.from(base64Data, 'base64');
  const ext = format === 'jpeg' ? 'jpg' : format.replace('+xml', '');
  const contentType = `image/${format}`;
  const fullFilename = `${filename}.${ext}`;
  const storagePath = `avatars/${fullFilename}`;

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
  console.log('=== Generating 4 Avatar Images ===\n');

  const results = [];

  for (const avatar of avatars) {
    try {
      // Generate image
      const dataUrl = await generateImage(avatar);

      // Upload to Supabase
      const publicUrl = await uploadToSupabase(dataUrl, avatar.id);

      results.push({
        id: avatar.id,
        name: avatar.name,
        age: avatar.age,
        url: publicUrl
      });

      console.log(`\n[${avatar.id}] Done!\n`);

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`[${avatar.id}] FAILED:`, err.message);
      results.push({
        id: avatar.id,
        name: avatar.name,
        error: err.message
      });
    }
  }

  console.log('\n=== RESULTS ===\n');
  console.log(JSON.stringify(results, null, 2));

  // Output code snippet
  console.log('\n=== CODE SNIPPET FOR page.tsx ===\n');
  console.log('// Update avatar URLs in QuoteTestimonialsSection:');
  for (const r of results) {
    if (r.url) {
      console.log(`// ${r.name}: "${r.url}"`);
    }
  }
}

main().catch(console.error);
