import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  // Get events with answers
  const { data: events } = await supabase
    .from('quiz_step_events')
    .select('session_id, step_number, question_id, event_type, answer_value, time_spent_seconds')
    .not('answer_value', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10);

  console.log('Events with answers:');
  console.log(JSON.stringify(events, null, 2));

  // Get all events for analysis
  const { data: allEvents } = await supabase
    .from('quiz_step_events')
    .select('session_id, step_number')
    .order('created_at', { ascending: true });

  // Calculate max step per session
  const sessionMaxStep = {};
  allEvents?.forEach(e => {
    if (!sessionMaxStep[e.session_id] || e.step_number > sessionMaxStep[e.session_id]) {
      sessionMaxStep[e.session_id] = e.step_number;
    }
  });

  // Count sessions by max step reached
  const dropoffByStep = {};
  Object.values(sessionMaxStep).forEach(step => {
    dropoffByStep[step] = (dropoffByStep[step] || 0) + 1;
  });

  console.log('\nMax step reached per session (dropoff analysis):');
  const sortedSteps = Object.entries(dropoffByStep).sort((a, b) => Number(a[0]) - Number(b[0]));
  sortedSteps.forEach(([step, count]) => {
    console.log(`  Step ${step}: ${count} sessions`);
  });

  // Check which sessions are completed
  const { data: completedSessions } = await supabase
    .from('quiz_results_v2')
    .select('session_id')
    .not('session_id', 'is', null);

  const completedSet = new Set(completedSessions?.map(s => s.session_id) || []);
  const trackedSessions = Object.keys(sessionMaxStep);
  const completedTracked = trackedSessions.filter(s => completedSet.has(s));
  const abandonedSessions = trackedSessions.filter(s => !completedSet.has(s));

  console.log('\n--- Summary ---');
  console.log('Tracked sessions:', trackedSessions.length);
  console.log('Completed (in quiz_results_v2):', completedTracked.length);
  console.log('Abandoned:', abandonedSessions.length);

  if (abandonedSessions.length > 0) {
    console.log('\nAbandoned session details:');
    abandonedSessions.forEach(sessionId => {
      console.log(`  ${sessionId}: stopped at step ${sessionMaxStep[sessionId]}`);
    });
  }
}

check();
