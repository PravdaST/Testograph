/**
 * Funnel Analytics Tracker
 *
 * Tracks user behavior and conversion metrics through the sales funnel.
 * Stores data in Supabase for analysis.
 */

import { supabase } from '@/integrations/supabase/client';

// Types
export type OfferTier = 'premium' | 'regular' | 'digital' | null;

export type EventType =
  | 'step_entered'
  | 'step_exited'
  | 'button_clicked'
  | 'skip_used'
  | 'offer_viewed'
  | 'exit_intent'
  | 'choice_made';

export interface UserData {
  firstName?: string;
  age?: string;
  weight?: string;
  height?: string;
  libido?: string;
  morningEnergy?: string;
  mood?: string;
  email?: string;
  [key: string]: any;
}

export interface EventMetadata {
  buttonText?: string;
  choiceValue?: number;
  timeSpentSeconds?: number;
  offerTier?: OfferTier;
  previousStep?: number;
  [key: string]: any;
}

// Session storage key
const SESSION_ID_KEY = 'testograph_funnel_session_id';

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `funnel_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get or create session ID
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Initialize a new funnel session
 */
export async function initFunnelSession(userData?: UserData): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const sessionId = getSessionId();

    const { error } = await supabase
      .from('funnel_sessions')
      .insert({
        session_id: sessionId,
        user_email: userData?.email || null,
        user_data: userData || {},
        entry_time: new Date().toISOString(),
        last_activity: new Date().toISOString(),
      });

    if (error) {
      console.error('Error initializing funnel session:', error);
      return null;
    }

    console.log('✅ Funnel session initialized:', sessionId);
    return sessionId;
  } catch (error) {
    console.error('Exception initializing funnel session:', error);
    return null;
  }
}

/**
 * Track when user enters a step
 */
export async function trackStepEntered(
  stepNumber: number,
  metadata?: EventMetadata
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const sessionId = getSessionId();

    const { error } = await supabase
      .from('funnel_events')
      .insert({
        session_id: sessionId,
        step_number: stepNumber,
        event_type: 'step_entered',
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Error tracking step entered:', error);
    } else {
      console.log(`📊 Step ${stepNumber} entered`);
    }
  } catch (error) {
    console.error('Exception tracking step entered:', error);
  }
}

/**
 * Track when user exits a step
 */
export async function trackStepExited(
  stepNumber: number,
  timeSpentSeconds?: number,
  metadata?: EventMetadata
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const sessionId = getSessionId();

    const { error } = await supabase
      .from('funnel_events')
      .insert({
        session_id: sessionId,
        step_number: stepNumber,
        event_type: 'step_exited',
        metadata: { ...metadata, timeSpentSeconds },
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Error tracking step exited:', error);
    } else {
      console.log(`📊 Step ${stepNumber} exited (${timeSpentSeconds}s)`);
    }
  } catch (error) {
    console.error('Exception tracking step exited:', error);
  }
}

/**
 * Track button clicks (CTA, Skip, Decline, etc.)
 */
export async function trackButtonClick(
  stepNumber: number,
  buttonText: string,
  metadata?: EventMetadata
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const sessionId = getSessionId();

    const { error } = await supabase
      .from('funnel_events')
      .insert({
        session_id: sessionId,
        step_number: stepNumber,
        event_type: 'button_clicked',
        metadata: { ...metadata, buttonText },
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Error tracking button click:', error);
    } else {
      console.log(`🖱️ Button clicked: "${buttonText}" on step ${stepNumber}`);
    }
  } catch (error) {
    console.error('Exception tracking button click:', error);
  }
}

/**
 * Track when skip is used
 */
export async function trackSkipUsed(
  stepNumber: number,
  metadata?: EventMetadata
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const sessionId = getSessionId();

    const { error } = await supabase
      .from('funnel_events')
      .insert({
        session_id: sessionId,
        step_number: stepNumber,
        event_type: 'skip_used',
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Error tracking skip used:', error);
    } else {
      console.log(`⏭️ Skip used on step ${stepNumber}`);
    }
  } catch (error) {
    console.error('Exception tracking skip used:', error);
  }
}

/**
 * Track when an offer is viewed
 */
export async function trackOfferView(
  stepNumber: number,
  offerTier: OfferTier,
  metadata?: EventMetadata
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const sessionId = getSessionId();

    const { error } = await supabase
      .from('funnel_events')
      .insert({
        session_id: sessionId,
        step_number: stepNumber,
        event_type: 'offer_viewed',
        metadata: { ...metadata, offerTier },
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Error tracking offer view:', error);
    } else {
      console.log(`👁️ Offer viewed: ${offerTier} on step ${stepNumber}`);
    }
  } catch (error) {
    console.error('Exception tracking offer view:', error);
  }
}

/**
 * Track user choice (e.g., picking option in Step 2b)
 */
export async function trackChoiceMade(
  stepNumber: number,
  choiceValue: number,
  metadata?: EventMetadata
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const sessionId = getSessionId();

    const { error } = await supabase
      .from('funnel_events')
      .insert({
        session_id: sessionId,
        step_number: stepNumber,
        event_type: 'choice_made',
        metadata: { ...metadata, choiceValue },
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Error tracking choice made:', error);
    } else {
      console.log(`✅ Choice made: ${choiceValue} on step ${stepNumber}`);
    }
  } catch (error) {
    console.error('Exception tracking choice made:', error);
  }
}

/**
 * Track exit intent (when user tries to leave)
 */
export async function trackExitIntent(
  stepNumber: number,
  metadata?: EventMetadata
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const sessionId = getSessionId();

    const { error } = await supabase
      .from('funnel_events')
      .insert({
        session_id: sessionId,
        step_number: stepNumber,
        event_type: 'exit_intent',
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Error tracking exit intent:', error);
    } else {
      console.log(`🚪 Exit intent on step ${stepNumber}`);
    }
  } catch (error) {
    console.error('Exception tracking exit intent:', error);
  }
}

/**
 * Mark funnel as exited at specific step
 */
export async function trackFunnelExit(
  exitStep: number,
  completed: boolean = false
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const sessionId = getSessionId();

    const { error } = await supabase
      .from('funnel_sessions')
      .update({
        exit_step: exitStep,
        completed: completed,
        last_activity: new Date().toISOString(),
      })
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error tracking funnel exit:', error);
    } else {
      console.log(`🏁 Funnel ${completed ? 'completed' : 'exited'} at step ${exitStep}`);
    }
  } catch (error) {
    console.error('Exception tracking funnel exit:', error);
  }
}

/**
 * Update offer tier for session
 */
export async function updateOfferTier(offerTier: OfferTier): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const sessionId = getSessionId();

    const { error } = await supabase
      .from('funnel_sessions')
      .update({
        offer_tier: offerTier,
        last_activity: new Date().toISOString(),
      })
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error updating offer tier:', error);
    } else {
      console.log(`💎 Offer tier updated: ${offerTier}`);
    }
  } catch (error) {
    console.error('Exception updating offer tier:', error);
  }
}

/**
 * Clear session (for testing or reset)
 */
export function clearFunnelSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_ID_KEY);
  console.log('🧹 Funnel session cleared');
}

/**
 * Build UTM parameters for tracking
 */
export function buildUTMParams(params: {
  tier?: string;
  step?: number;
  content?: string;
}): string {
  const sessionId = getSessionId();
  const utmParams = new URLSearchParams({
    utm_source: 'testograph',
    utm_medium: 'funnel',
    utm_campaign: 'waiting_room',
    utm_content: params.content || params.tier || 'unknown',
    utm_term: params.step ? `step${params.step}` : 'final',
    session_id: sessionId,
  });

  return utmParams.toString();
}

/**
 * Add UTM parameters to URL
 */
export function addUTMToUrl(url: string, params: {
  tier?: string;
  step?: number;
  content?: string;
}): string {
  const utmString = buildUTMParams(params);
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${utmString}`;
}

/**
 * Track CTA click with URL
 */
export async function trackCTAClick(
  stepNumber: number,
  tier: string,
  url: string,
  metadata?: EventMetadata
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const sessionId = getSessionId();

    const { error } = await supabase
      .from('funnel_events')
      .insert({
        session_id: sessionId,
        step_number: stepNumber,
        event_type: 'button_clicked',
        metadata: { ...metadata, tier, url, action: 'cta_click' },
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Error tracking CTA click:', error);
    } else {
      console.log(`🔗 CTA clicked: ${tier} - ${url}`);
    }
  } catch (error) {
    console.error('Exception tracking CTA click:', error);
  }
}
