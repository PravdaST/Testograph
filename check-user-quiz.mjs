import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mrpsaqtmucxpawajfxfn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ycHNhcXRtdWN4cGF3YWpmeGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5MTM3OCwiZXhwIjoyMDc0NjY3Mzc4fQ.8wvWlc4rVRyHemfg5_MzogiIVhwKO1g7ui8xAwjW2gQ'
);

async function check() {
  // Check all recent step events grouped by session (last 48h)
  const { data: events, error } = await supabase
    .from('quiz_step_events')
    .select('session_id, category, step_number, question_id, event_type, answer_value, metadata, created_at')
    .gte('created_at', new Date(Date.now() - 48*60*60*1000).toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.log('Error:', error);
    return;
  }

  // Group by session
  const sessions = {};
  events.forEach(e => {
    if (!sessions[e.session_id]) sessions[e.session_id] = [];
    sessions[e.session_id].push(e);
  });

  console.log('=== Sessions reaching step 20+ (potential incomplete) ===\n');

  // Sort sessions by max step reached
  const sessionSummary = Object.entries(sessions).map(([sid, evts]) => {
    const maxStep = Math.max(...evts.map(e => e.step_number));
    const category = evts[0].category;
    const firstEvent = evts[evts.length - 1];
    const lastEvent = evts[0];

    // Check for email in answer_value
    const emailEvent = evts.find(e => e.question_id && e.question_id.includes('email') && e.answer_value);
    const nameEvent = evts.find(e => e.question_id && e.question_id.includes('name') && e.answer_value);
    const email = emailEvent?.answer_value || 'unknown';
    const name = nameEvent?.answer_value || '';

    return {
      session_id: sid,
      category,
      maxStep,
      email,
      name,
      totalEvents: evts.length,
      started: new Date(firstEvent.created_at).toLocaleString(),
      lastActivity: new Date(lastEvent.created_at).toLocaleString()
    };
  }).sort((a, b) => b.maxStep - a.maxStep);

  // Show sessions that reached high step counts but might not have completed
  sessionSummary.forEach(s => {
    if (s.maxStep >= 20 || s.email.includes('mihail')) {
      console.log('Session:', s.session_id.substring(0, 30));
      console.log('  Category:', s.category, '| Max Step:', s.maxStep, '| Events:', s.totalEvents);
      console.log('  Email:', s.email);
      console.log('  Name:', s.name);
      console.log('  Started:', s.started);
      console.log('  Last activity:', s.lastActivity);
      console.log('');
    }
  });

  // Now let's check if the email appears in quiz_results_v2 for these sessions
  console.log('\n=== Checking which sessions completed vs failed ===\n');

  const { data: results } = await supabase
    .from('quiz_results_v2')
    .select('email, created_at')
    .gte('created_at', new Date(Date.now() - 48*60*60*1000).toISOString());

  const completedEmails = new Set(results?.map(r => r.email) || []);

  sessionSummary.filter(s => s.maxStep >= 20).forEach(s => {
    const completed = completedEmails.has(s.email);
    if (!completed && s.email !== 'unknown') {
      console.log('FAILED TO COMPLETE:', s.email);
      console.log('  Session:', s.session_id.substring(0, 30));
      console.log('  Max Step:', s.maxStep);
      console.log('  Last activity:', s.lastActivity);
      console.log('');
    }
  });
}

check();
