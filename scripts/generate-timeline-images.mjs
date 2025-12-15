/**
 * Generate 3 timeline milestone images for TestoUP
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

const milestones = [
  {
    id: 'day-7',
    name: 'Day 7 - First Changes',
    prompt: `Athletic man in his 30s waking up energized in morning light, stretching with vitality, bedroom setting with sunrise through window.
Modern lifestyle photography, warm golden hour lighting, soft focus background.
Man looks refreshed, confident smile, natural pose.
Clean minimal bedroom aesthetic, high-end advertising style.
PHOTOREALISTIC, professional photography, shallow depth of field.
NO TEXT, NO LETTERS, NO WORDS. Pure visual only.`
  },
  {
    id: 'day-30',
    name: 'Day 30 - Real Difference',
    prompt: `Fit muscular man in his 30s at gym, lifting weights with confident expression, visible muscle definition.
Dynamic gym photography, dramatic side lighting, motion blur on weights.
Sweat glistening, focused intense expression, powerful stance.
Modern gym environment, dark moody background with accent lights.
PHOTOREALISTIC, professional sports photography, high contrast.
NO TEXT, NO LETTERS, NO WORDS. Pure visual only.`
  },
  {
    id: 'day-90',
    name: 'Day 90 - Full Transformation',
    prompt: `Transformed athletic man in his 30s, shirtless showing muscular physique, standing confidently outdoors.
Epic hero shot photography, golden hour backlighting creating silhouette glow.
Visible abs, defined muscles, triumphant pose with arms slightly raised.
Mountain or ocean backdrop, cinematic composition.
PHOTOREALISTIC, professional fitness photography, dramatic lighting.
NO TEXT, NO LETTERS, NO WORDS. Pure visual only.`
  }
];

async function generateImage(milestone) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set');

  console.log(`[${milestone.id}] Generating image...`);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://testograph.eu',
      'X-Title': 'Testograph Timeline Images'
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      messages: [{ role: 'user', content: milestone.prompt }],
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

  console.log(`[${milestone.id}] Image generated successfully`);
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
  const fullFilename = `${filename}.${format === 'jpeg' ? 'jpg' : format}`;
  const storagePath = `timeline/${fullFilename}`;

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
  console.log('=== Generating 3 Timeline Milestone Images ===\n');

  const results = [];

  for (const milestone of milestones) {
    try {
      // Generate image
      const dataUrl = await generateImage(milestone);

      // Upload to Supabase
      const publicUrl = await uploadToSupabase(dataUrl, milestone.id);

      results.push({
        id: milestone.id,
        name: milestone.name,
        url: publicUrl
      });

      console.log(`\n[${milestone.id}] Done!\n`);

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`[${milestone.id}] FAILED:`, err.message);
      results.push({
        id: milestone.id,
        name: milestone.name,
        error: err.message
      });
    }
  }

  console.log('\n=== RESULTS ===\n');
  console.log(JSON.stringify(results, null, 2));

  // Output code snippet
  console.log('\n=== CODE SNIPPET ===\n');
  console.log('const timelineImages = {');
  for (const r of results) {
    if (r.url) {
      console.log(`  "${r.id}": "${r.url}",`);
    }
  }
  console.log('};');
}

main().catch(console.error);
