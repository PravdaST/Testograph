/**
 * Generate pill/capsule images for background decoration
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

const images = [
  {
    id: 'pills-scattered',
    prompt: `Several green supplement capsules scattered on dark surface, artistic product photography.
Soft dramatic lighting, dark gray/black background, shallow depth of field.
Green translucent gelatin capsules with herbal powder inside, some in focus some blurred.
High-end supplement advertising style, clean minimal aesthetic.
PHOTOREALISTIC, professional DSLR photography, macro lens.
NO TEXT, NO LETTERS, NO WORDS, NO LABELS. Pure visual only.
Horizontal composition, capsules naturally scattered.`
  },
  {
    id: 'pills-floating',
    prompt: `Green supplement capsules floating in air against dark background, dynamic product shot.
Studio lighting with rim light, deep black background, motion freeze effect.
Green translucent gelatin capsules with herbal powder visible inside.
Premium supplement brand aesthetic, high contrast, sharp focus.
PHOTOREALISTIC, professional product photography.
NO TEXT, NO LETTERS, NO WORDS, NO LABELS. Pure visual only.
Square format, capsules at different angles and depths.`
  }
];

async function generateImage(item) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set');

  console.log(`[${item.id}] Generating image...`);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://testograph.eu',
      'X-Title': 'Testograph Pills Images'
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      messages: [{ role: 'user', content: item.prompt }],
      modalities: ['image', 'text'],
      max_tokens: 8192
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  let imageDataUrl = null;

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

  console.log(`[${item.id}] Image generated successfully`);
  return imageDataUrl;
}

async function uploadToSupabase(dataUrl, filename) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const matches = dataUrl.match(/^data:image\/([\w+]+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid data URL');

  const [, format, base64Data] = matches;
  const buffer = Buffer.from(base64Data, 'base64');
  const ext = format === 'jpeg' ? 'jpg' : format.replace('+xml', '');
  const contentType = `image/${format}`;
  const fullFilename = `${filename}.${ext}`;
  const storagePath = `product/${fullFilename}`;

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
  console.log('=== Generating Pills Images ===\n');

  const results = [];

  for (const item of images) {
    try {
      const dataUrl = await generateImage(item);
      const publicUrl = await uploadToSupabase(dataUrl, item.id);

      results.push({
        id: item.id,
        url: publicUrl
      });

      console.log(`\n[${item.id}] Done!\n`);
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`[${item.id}] FAILED:`, err.message);
      results.push({
        id: item.id,
        error: err.message
      });
    }
  }

  console.log('\n=== RESULTS ===\n');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
