import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mrpsaqtmucxpawajfxfn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ycHNhcXRtdWN4cGF3YWpmeGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTEzNzgsImV4cCI6MjA3NDY2NzM3OH0.J40BZusEdbyQVdqyyP5_A6nnzrOqH-Rbjzr_cBbC0Uc'
);

async function checkData() {
  console.log('🔍 Checking Supabase DB data...\n');

  // Check funnel_sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('funnel_sessions')
    .select('*')
    .order('entry_time', { ascending: false })
    .limit(5);

  if (sessionsError) {
    console.error('❌ Error fetching funnel_sessions:', sessionsError);
  } else {
    console.log('📊 FUNNEL_SESSIONS Table:');
    console.log(`   Total records: ${sessions?.length || 0}`);
    if (sessions && sessions.length > 0) {
      console.log('\n   Latest record:');
      const latest = sessions[0];
      console.log(`   - ID: ${latest.id}`);
      console.log(`   - Session ID: ${latest.session_id}`);
      console.log(`   - Email: ${latest.user_email || 'N/A'}`);
      console.log(`   - Entry Time: ${latest.entry_time}`);
      console.log(`   - Last Activity: ${latest.last_activity}`);
      console.log(`   - Completed: ${latest.completed}`);
      console.log(`   - Exit Step: ${latest.exit_step || 'N/A'}`);
      console.log(`   - Offer Tier: ${latest.offer_tier || 'N/A'}`);
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Check funnel_events
  const { data: events, error: eventsError } = await supabase
    .from('funnel_events')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(10);

  if (eventsError) {
    console.error('❌ Error fetching funnel_events:', eventsError);
  } else {
    console.log('📊 FUNNEL_EVENTS Table:');
    console.log(`   Total records: ${events?.length || 0}`);
    if (events && events.length > 0) {
      console.log('\n   Latest events:');
      events.forEach((event, index) => {
        console.log(`\n   ${index + 1}. ${event.event_type}`);
        console.log(`      - Step: ${event.step_number}`);
        console.log(`      - Session ID: ${event.session_id}`);
        console.log(`      - Timestamp: ${event.timestamp}`);
        if (event.metadata) {
          console.log(`      - Metadata: ${JSON.stringify(event.metadata)}`);
        }
      });
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Check date range
  if (sessions && sessions.length > 0) {
    const now = new Date();
    const entryDate = new Date(sessions[0].entry_time);
    const daysDiff = Math.floor((now - entryDate) / (1000 * 60 * 60 * 24));

    console.log('📅 DATE ANALYSIS:');
    console.log(`   Current date: ${now.toISOString()}`);
    console.log(`   Latest entry_time: ${sessions[0].entry_time}`);
    console.log(`   Days ago: ${daysDiff} days`);
    console.log(`\n   ⚠️  Default analytics filter is 7 days`);
    if (daysDiff > 7) {
      console.log(`   ❌ Your data is ${daysDiff} days old - TOO OLD for 7-day filter!`);
      console.log(`   ✅ Try selecting "30 days" or "90 days" on analytics page`);
    } else {
      console.log(`   ✅ Your data is within 7-day range - should be visible!`);
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Check chat_sessions
  const { data: chatSessions, error: chatError } = await supabase
    .from('chat_sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  if (chatError) {
    console.error('❌ Error fetching chat_sessions:', chatError);
  } else {
    console.log('💬 CHAT_SESSIONS Table:');
    console.log(`   Total records: ${chatSessions?.length || 0}`);
    if (chatSessions && chatSessions.length > 0) {
      console.log('\n   Latest sessions:');
      chatSessions.forEach((session, index) => {
        console.log(`\n   ${index + 1}. ${session.email}`);
        console.log(`      - Created: ${session.created_at}`);
        console.log(`      - PDF: ${session.pdf_filename || 'No PDF'}`);
      });
    }
  }
}

checkData()
  .then(() => {
    console.log('\n✅ DB check complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
