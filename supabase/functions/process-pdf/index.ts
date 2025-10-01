// Зависимости
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
if (!supabaseUrl || !supabaseServiceKey) throw new Error('Missing SUPABASE envs');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function uint8ToBase64(u8: Uint8Array) {
  const CHUNK = 0x8000;
  let i = 0;
  const parts = [];
  while (i < u8.length) {
    const slice = u8.subarray(i, Math.min(i + CHUNK, u8.length));
    parts.push(String.fromCharCode(...slice));
    i += CHUNK;
  }
  return btoa(parts.join(''));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const pdfFile = formData.get('pdf') as File;
    const email = formData.get('email') as string;
    const sessionId = formData.get('sessionId') as string;

    if (!pdfFile || !email) throw new Error('PDF file and email are required');
    if (!openAIApiKey) throw new Error('OPENAI_API_KEY is not set');

    // Ensure we have a valid session id for this email
    let finalSessionId = sessionId;
    if (!finalSessionId) {
      const { data: existingSessions, error: findErr } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1);
      if (findErr) {
        console.error('Find session error:', findErr);
      }
      if (existingSessions && existingSessions.length > 0) {
        finalSessionId = existingSessions[0].id;
      } else {
        const { data: newSession, error: newErr } = await supabase
          .from('chat_sessions')
          .insert({ email })
          .select('id')
          .single();
        if (newErr) throw new Error('Failed to create chat session');
        finalSessionId = newSession.id;
      }
    }

    // 1) Качване в Supabase Storage
    const fileName = `${Date.now()}-${pdfFile.name}`;
    const filePath = `${email}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('pdf-documents')
      .upload(filePath, pdfFile, { contentType: 'application/pdf', upsert: false });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload PDF to Supabase Storage');
    }
    const { data: { publicUrl } } = supabase.storage.from('pdf-documents').getPublicUrl(filePath);

    // 2) Превръщане в Base64 за директно използване
    const pdfBuffer = await pdfFile.arrayBuffer();
    const uint8 = new Uint8Array(pdfBuffer);
    const base64PDF = uint8ToBase64(uint8);

    if (!openAIApiKey) throw new Error('OPENAI_API_KEY is not set');

    // 3) Използваме OpenAI Files API за анализ на PDF
    console.log(`Processing PDF file: ${pdfFile.name}, size: ${pdfFile.size} bytes`);

    let extractedTextRaw = "[NO_ANALYSIS]";

    try {
      // Upload PDF to OpenAI Files API
      const filesForm = new FormData();
      filesForm.append('file', new Blob([uint8], { type: 'application/pdf' }), pdfFile.name);
      filesForm.append('purpose', 'assistants');

      console.log('Uploading PDF to OpenAI Files API...');
      const fileUploadResp = await fetch('https://api.openai.com/v1/files', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openAIApiKey}` },
        body: filesForm
      });

      if (!fileUploadResp.ok) {
        const errText = await fileUploadResp.text();
        console.error('File upload failed:', errText);
        throw new Error(`File upload failed: ${fileUploadResp.status} - ${errText}`);
      }

      const uploaded = await fileUploadResp.json();
      const fileId = uploaded.id as string;
      console.log('File uploaded successfully:', fileId);

      // Create assistant with file search
      console.log('Creating assistant for file analysis...');
      const assistantResp = await fetch('https://api.openai.com/v1/assistants', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          name: 'Hormone Analysis Expert',
          instructions: `Ти си експерт по хормонални анализи. Анализирай PDF документи с лабораторни резултати от Testograph и извлечи всички стойности точно както са написани в документа.

Винаги отговаряй на български в този формат:

=== ЛАБОРАТОРНИ РЕЗУЛТАТИ ===
[Извлечи ВСИЧКИ стойности точно както са в документа с единици]

=== ПРОФЕСИОНАЛНА ОЦЕНКА ===
[Детайлен анализ на всяка стойност]

=== ПЛАН ЗА ПОДОБРЕНИЕ ===
[Конкретни препоръки]

ВАЖНО: Използвай САМО реалните стойности от документа!`,
          model: 'gpt-4o',
          tools: [{ type: 'file_search' }],
          tool_resources: {
            file_search: {
              vector_stores: [{
                file_ids: [fileId]
              }]
            }
          }
        })
      });

      if (!assistantResp.ok) {
        const errText = await assistantResp.text();
        console.error('Assistant creation failed:', errText);
        throw new Error(`Assistant creation failed: ${assistantResp.status} - ${errText}`);
      }

      const assistant = await assistantResp.json();
      console.log('Assistant created:', assistant.id);

      // Create thread
      const threadResp = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({})
      });

      if (!threadResp.ok) {
        throw new Error(`Thread creation failed: ${threadResp.status}`);
      }

      const thread = await threadResp.json();
      console.log('Thread created:', thread.id);

      // Add message to thread
      const messageResp = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          role: 'user',
          content: `Анализирай прикачения PDF файл с хормонални резултати от Testograph. Извлечи всички лабораторни стойности и направи професионален анализ. Използвай точния формат който съм ти дал в инструкциите.`
        })
      });

      if (!messageResp.ok) {
        throw new Error(`Message creation failed: ${messageResp.status}`);
      }

      // Run assistant
      const runResp = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          assistant_id: assistant.id
        })
      });

      if (!runResp.ok) {
        throw new Error(`Run creation failed: ${runResp.status}`);
      }

      const run = await runResp.json();
      console.log('Run started:', run.id);

      // Wait for completion (with timeout)
      let runStatus = run.status;
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max

      while (runStatus === 'queued' || runStatus === 'in_progress') {
        if (attempts >= maxAttempts) {
          throw new Error('Analysis timeout after 30 seconds');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        const statusResp = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        });

        if (statusResp.ok) {
          const statusData = await statusResp.json();
          runStatus = statusData.status;
          console.log(`Run status: ${runStatus} (attempt ${attempts + 1})`);
        }

        attempts++;
      }

      if (runStatus === 'completed') {
        // Get messages
        const messagesResp = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        });

        if (messagesResp.ok) {
          const messages = await messagesResp.json();
          const lastMessage = messages.data[0];
          if (lastMessage && lastMessage.content && lastMessage.content[0] && lastMessage.content[0].text) {
            extractedTextRaw = lastMessage.content[0].text.value;
            console.log('Analysis completed successfully, text length:', extractedTextRaw.length);
          }
        }
      } else {
        console.error('Run failed with status:', runStatus);
      }

      // Cleanup
      try {
        await fetch(`https://api.openai.com/v1/assistants/${assistant.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        });
        await fetch(`https://api.openai.com/v1/files/${fileId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${openAIApiKey}` }
        });
      } catch (cleanupError) {
        console.warn('Cleanup error:', cleanupError);
      }

    } catch (apiError) {
      console.error('OpenAI API error:', apiError);
      extractedTextRaw = "[NO_ANALYSIS]";
    }

    let finalAnalysis = '';
    if (extractedTextRaw.includes('[SCAN_ERROR]') || extractedTextRaw.includes('[NO_ANALYSIS]')) {
      // Fallback if analysis failed
      finalAnalysis = `PDF файлът не може да бъде анализиран автоматично.
Моля, опитайте отново или се свържете с техническа подкрепа.

ТЕХНИЧЕСКА ИНФОРМАЦИЯ:
- OpenAI Vision API статус: Неуспешен
- Файл размер: ${pdfFile.size} bytes
- Файл име: ${pdfFile.name}`;
    } else {
      finalAnalysis = extractedTextRaw;
    }

    // 5) Съставяне на текст за запазване
    const extractedText = `РЕАЛЕН PDF АНАЛИЗ - ${pdfFile.name}\n\n${finalAnalysis}\n\n=== ТЕХНИЧЕСКА ИНФОРМАЦИЯ ===\nPDF файл: ${pdfFile.name}\nРазмер: ${pdfFile.size} bytes\nМетод: OpenAI Vision API\nДата: ${new Date().toLocaleString('bg-BG')}\nСтатус: ${finalAnalysis.includes('SCAN_ERROR') || finalAnalysis.includes('NO_ANALYSIS') ? 'Грешка при анализ' : 'Успешно анализиран'}`;

    // 6) Запис в базата
    const { error: updateError } = await supabase.from('chat_sessions').update({
      pdf_url: publicUrl,
      pdf_filename: pdfFile.name,
      pdf_content: extractedText
    }).eq('id', finalSessionId).eq('email', email);

    if (updateError) throw new Error('Failed to update session in DB');

    return new Response(JSON.stringify({
      success: true,
      message: 'PDF файлът беше обработен успешно!',
      extractedText: extractedText.substring(0, 600) + '...',
      filename: pdfFile.name,
      url: publicUrl,
      hasRealContent: !finalAnalysis.includes('SCAN_ERROR') && !finalAnalysis.includes('NO_ANALYSIS')
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error in PDF processing:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal server error'
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
