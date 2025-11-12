import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export const maxDuration = 60; // Maximum 60 seconds for Vercel

export async function POST(request: Request) {
  let browser;

  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    console.log('📄✨ Generating ENHANCED PDF for token:', token);

    // Fetch result data to validate token and check AI status
    const { data: result, error: fetchError } = await supabase
      .from('quiz_results')
      .select('id, email, first_name, ai_analysis_status, ai_analysis_text')
      .eq('result_token', token)
      .single();

    if (fetchError || !result) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      );
    }

    // Check if AI analysis is completed
    if (result.ai_analysis_status !== 'completed' || !result.ai_analysis_text) {
      return NextResponse.json(
        { error: 'AI analysis not ready yet', status: result.ai_analysis_status },
        { status: 425 } // Too Early
      );
    }

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2
    });

    // Construct result page URL
    const resultPageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.testograph.eu'}/test/result/${token}`;

    console.log('🌐 Navigating to:', resultPageUrl);

    // Navigate to result page (now with AI insights)
    await page.goto(resultPageUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for content including AI insights to be fully rendered
    await page.waitForSelector('main', { timeout: 10000 });

    // Wait a bit longer for AI insights to render
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Hide any interactive elements that shouldn't be in PDF
    await page.addStyleTag({
      content: `
        button { display: none !important; }
        footer { display: none !important; }
        .no-print { display: none !important; }
      `
    });

    console.log('📸✨ Generating ENHANCED PDF with AI insights...');

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();
    browser = undefined;

    // Upload to Supabase Storage
    const fileName = `quiz-results/${result.id}/${Date.now()}-enhanced.pdf`;

    console.log('☁️✨ Uploading ENHANCED PDF to Supabase Storage:', fileName);

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('pdfs')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload enhanced PDF' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('pdfs')
      .getPublicUrl(fileName);

    console.log('✅✨ ENHANCED PDF generated and uploaded:', publicUrl);

    // Update database with enhanced PDF URL
    const { error: updateError } = await supabase
      .from('quiz_results')
      .update({
        pdf_enhanced_url: publicUrl,
        pdf_enhanced_downloaded_at: new Date().toISOString()
      })
      .eq('result_token', token);

    if (updateError) {
      console.error('Database update error:', updateError);
    }

    // Trigger follow-up email in background (non-blocking)
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3006'}/api/quiz/send-followup-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    }).then(() => {
      console.log('✅ Follow-up email triggered');
    }).catch((emailError) => {
      console.error('Failed to trigger follow-up email:', emailError);
    });

    return NextResponse.json({
      success: true,
      pdfUrl: publicUrl,
      fileName
    });

  } catch (error: any) {
    console.error('Error generating enhanced PDF:', error);

    if (browser) {
      await browser.close();
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate enhanced PDF' },
      { status: 500 }
    );
  }
}
