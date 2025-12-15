/**
 * Generate images with clothed men for TestoUP landing page
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
    id: 'energetic-man-clothed',
    folder: 'did-you-know',
    filename: 'energetic-man',
    prompt: `Professional lifestyle photo of a confident Bulgarian man in his mid-30s, wearing a fitted dark grey henley shirt.
Athletic build visible through clothing, standing with good posture, arms relaxed.
Bright modern gym or home fitness space background, soft natural lighting.
Man has short dark hair, light stubble, warm genuine smile, looking at camera.
Clean minimal aesthetic, high-end fitness brand advertising style.
PHOTOREALISTIC, professional photography, shallow depth of field.
NO TEXT, NO LETTERS, NO WORDS, NO LABELS. Pure visual only.
Vertical portrait orientation, upper body shot.`
  },
  {
    id: 'day-7-clothed',
    folder: 'timeline',
    filename: 'day-7',
    prompt: `Athletic man in his 30s waking up energized in morning, wearing a comfortable dark t-shirt, stretching with vitality.
Modern bedroom setting with soft sunrise light through window.
Man looks refreshed, confident smile, natural pose, sitting on bed edge.
Clean minimal bedroom aesthetic, high-end lifestyle photography.
PHOTOREALISTIC, professional photography, warm golden hour lighting.
NO TEXT, NO LETTERS, NO WORDS. Pure visual only.
Horizontal composition, medium shot showing upper body.`
  },
  {
    id: 'day-30-clothed',
    folder: 'timeline',
    filename: 'day-30',
    prompt: `Fit man in his 30s at gym wearing a fitted dark athletic compression shirt, doing dumbbell exercise with confident expression.
Modern gym environment, dramatic side lighting, slight motion blur on weights.
Focused intense expression, powerful stance, visible muscle definition through shirt.
Dark moody gym background with accent lights, high-end fitness photography.
PHOTOREALISTIC, professional sports photography, high contrast.
NO TEXT, NO LETTERS, NO WORDS. Pure visual only.
Horizontal composition, action shot.`
  },
  {
    id: 'day-90-clothed',
    folder: 'timeline',
    filename: 'day-90',
    prompt: `Transformed athletic man in his 30s wearing fitted black athletic tank top, standing confidently outdoors at sunset.
Epic hero shot, golden hour backlighting creating warm glow.
Visible athletic physique through clothing, triumphant confident pose.
Mountain trail or outdoor fitness area backdrop, cinematic composition.
PHOTOREALISTIC, professional fitness lifestyle photography, dramatic lighting.
NO TEXT, NO LETTERS, NO WORDS. Pure visual only.
Horizontal composition, full upper body shot.`
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
      'X-Title': 'Testograph Clothed Men Images'
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

async function uploadToSupabase(dataUrl, folder, filename) {
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
  const storagePath = `${folder}/${fullFilename}`;

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
  console.log('=== Generating Clothed Men Images ===\n');

  const results = [];

  for (const item of images) {
    try {
      const dataUrl = await generateImage(item);
      const publicUrl = await uploadToSupabase(dataUrl, item.folder, item.filename);

      results.push({
        id: item.id,
        folder: item.folder,
        filename: item.filename,
        url: publicUrl
      });

      console.log(`\n[${item.id}] Done!\n`);
      await new Promise(r => setTimeout(r, 3000));
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
