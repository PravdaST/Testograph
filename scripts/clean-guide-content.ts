// Script to clean existing guide content from AI markdown artifacts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanGuideContent() {
  console.log('[Clean] Starting to clean guide content...');

  // Fetch the guide
  const { data: guide, error: fetchError } = await supabase
    .from('blog_posts')
    .select('id, title, content')
    .eq('slug', 'testosteron-guide-za-mizhe')
    .single();

  if (fetchError || !guide) {
    console.error('[Clean] Error fetching guide:', fetchError);
    return;
  }

  console.log('[Clean] Found guide:', guide.title);
  console.log('[Clean] Original content preview:', guide.content.substring(0, 200));

  // Clean the content
  let cleanedContent = guide.content;

  // Remove markdown code fences
  cleanedContent = cleanedContent.replace(/^```html\s*/i, '').replace(/^```\s*/, '').replace(/\s*```\s*$/g, '');

  // Remove AI introductory/meta text (anything before first HTML tag)
  const htmlTagMatch = cleanedContent.match(/<(div|p|h2|h3|ul|article)/i);
  if (htmlTagMatch && htmlTagMatch.index && htmlTagMatch.index > 0) {
    // There's text before the first HTML tag - remove it
    cleanedContent = cleanedContent.substring(htmlTagMatch.index);
  }

  // Additional cleanup: remove any remaining markdown artifacts
  cleanedContent = cleanedContent.replace(/^\*+\s*/gm, ''); // Remove asterisks at line start
  cleanedContent = cleanedContent.trim();

  console.log('[Clean] Cleaned content preview:', cleanedContent.substring(0, 200));

  // Update the guide
  const { error: updateError } = await supabase
    .from('blog_posts')
    .update({ content: cleanedContent })
    .eq('id', guide.id);

  if (updateError) {
    console.error('[Clean] Error updating guide:', updateError);
    return;
  }

  console.log('[Clean] ✅ Guide content cleaned successfully!');
}

cleanGuideContent().catch(console.error);
