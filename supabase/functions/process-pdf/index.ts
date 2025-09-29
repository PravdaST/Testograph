import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const pdfFile = formData.get('pdf') as File;
    const email = formData.get('email') as string;
    const sessionId = formData.get('sessionId') as string;

    if (!pdfFile || !email) {
      throw new Error('PDF file and email are required');
    }

    console.log(`Processing PDF for email: ${email}`);

    // Generate unique filename
    const fileName = `${Date.now()}-${pdfFile.name}`;
    const filePath = `${email}/${fileName}`;

    // Upload PDF to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdf-documents')
      .upload(filePath, pdfFile, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload PDF');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('pdf-documents')
      .getPublicUrl(filePath);

    // Update session with PDF info
    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({
        pdf_url: publicUrl,
        pdf_filename: pdfFile.name
      })
      .eq('id', sessionId)
      .eq('email', email);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error('Failed to update session');
    }

    // Extract text from PDF (simplified approach)
    const arrayBuffer = await pdfFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // For now, return a simple response indicating the PDF was uploaded
    // In a production environment, you would use a proper PDF parsing library
    const extractedText = `PDF файл "${pdfFile.name}" беше успешно качен и ще бъде използван като референция за отговори.`;

    return new Response(JSON.stringify({
      success: true,
      message: 'PDF файлът беше успешно обработен',
      extractedText,
      filename: pdfFile.name,
      url: publicUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-pdf function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});