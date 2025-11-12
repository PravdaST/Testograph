import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// import puppeteer from 'puppeteer'; // Disabled for Vercel deployment

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export const maxDuration = 60; // Maximum 60 seconds for Vercel

export async function POST(request: Request) {
  // PDF generation temporarily disabled for Vercel deployment
  return NextResponse.json(
    { error: 'PDF generation is temporarily unavailable' },
    { status: 503 }
  );

  /* let browser;

  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    console.log('📄 Generating PDF for token:', token);

    // Fetch result data to validate token
    const { data: result, error: fetchError } = await supabase
      .from('quiz_results')
      .select('id, email, first_name')
      .eq('result_token', token)
      .single();

    if (fetchError || !result) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
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

    // Navigate to result page
    await page.goto(resultPageUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for content to be fully rendered
    await page.waitForSelector('main', { timeout: 10000 });

    // Hide any interactive elements that shouldn't be in PDF
    await page.addStyleTag({
      content: `
        button { display: none !important; }
        footer { display: none !important; }
        .no-print { display: none !important; }
      `
    });

    console.log('📸 Generating PDF...');

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
    const fileName = `quiz-results/${result.id}/${Date.now()}-template.pdf`;

    console.log('☁️ Uploading PDF to Supabase Storage:', fileName);

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
        { error: 'Failed to upload PDF' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('pdfs')
      .getPublicUrl(fileName);

    console.log('✅ PDF generated and uploaded:', publicUrl);

    // Update database with PDF URL
    const { error: updateError } = await supabase
      .from('quiz_results')
      .update({
        pdf_template_url: publicUrl,
        pdf_downloaded_at: new Date().toISOString()
      })
      .eq('result_token', token);

    if (updateError) {
      console.error('Database update error:', updateError);
    }

    return NextResponse.json({
      success: true,
      pdfUrl: publicUrl,
      fileName
    });

  } catch (error: any) {
    console.error('Error generating PDF:', error);

    if (browser) {
      await browser.close();
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  } */
}
