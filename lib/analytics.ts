// Funnel Analytics Tracking System

export type FunnelEventType =
  | 'funnel_started'
  | 'funnel_step_reached'
  | 'funnel_step_completed'
  | 'funnel_choice_made'
  | 'funnel_offer_viewed'
  | 'funnel_cta_clicked'
  | 'funnel_offer_declined'
  | 'funnel_exit_popup_shown'
  | 'funnel_timer_expired'
  | 'funnel_abandoned'
  | 'funnel_completed';

export interface FunnelEvent {
  event: FunnelEventType;
  sessionId: string;
  timestamp: number;
  step?: number;
  choice?: string;
  tier?: string;
  url?: string;
  userData?: {
    firstName?: string;
    age?: string;
    weight?: string;
    height?: string;
    libido?: string;
    morningEnergy?: string;
    mood?: string;
  };
  metadata?: Record<string, any>;
}

// Generate unique session ID
export const generateSessionId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}`;
};

// Get or create session ID
export const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';

  const STORAGE_KEY = 'testograph_funnel_session_id';
  let sessionId = sessionStorage.getItem(STORAGE_KEY);

  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(STORAGE_KEY, sessionId);
  }

  return sessionId;
};

// Build UTM parameters
export const buildUTMParams = (params: {
  tier?: string;
  step?: number;
  content?: string;
}): string => {
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
};

// Add UTM parameters to URL
export const addUTMToUrl = (url: string, params: {
  tier?: string;
  step?: number;
  content?: string;
}): string => {
  const utmString = buildUTMParams(params);
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${utmString}`;
};

// Track funnel event
export const trackFunnelEvent = (event: Omit<FunnelEvent, 'sessionId' | 'timestamp'>): void => {
  if (typeof window === 'undefined') return;

  const sessionId = getSessionId();
  const funnelEvent: FunnelEvent = {
    ...event,
    sessionId,
    timestamp: Date.now(),
  };

  // Store in localStorage for offline persistence
  const STORAGE_KEY = 'testograph_funnel_events';
  const storedEvents = localStorage.getItem(STORAGE_KEY);
  const events: FunnelEvent[] = storedEvents ? JSON.parse(storedEvents) : [];
  events.push(funnelEvent);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));

  // Send to analytics API
  sendEventToAPI(funnelEvent);

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Funnel Analytics]', funnelEvent);
  }
};

// Send event to API endpoint
const sendEventToAPI = async (event: FunnelEvent): Promise<void> => {
  try {
    await fetch('/api/analytics/funnel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
  } catch (error) {
    console.error('Failed to send analytics event:', error);
  }
};

// Get all events for current session
export const getSessionEvents = (): FunnelEvent[] => {
  if (typeof window === 'undefined') return [];

  const STORAGE_KEY = 'testograph_funnel_events';
  const storedEvents = localStorage.getItem(STORAGE_KEY);
  if (!storedEvents) return [];

  const sessionId = getSessionId();
  const events: FunnelEvent[] = JSON.parse(storedEvents);
  return events.filter(e => e.sessionId === sessionId);
};

// Clear session events (after successful completion or abandon)
export const clearSessionEvents = (): void => {
  if (typeof window === 'undefined') return;

  const STORAGE_KEY = 'testograph_funnel_events';
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem('testograph_funnel_session_id');
};

// Helper: Track step view
export const trackStepView = (step: number, metadata?: Record<string, any>): void => {
  trackFunnelEvent({
    event: 'funnel_step_reached',
    step,
    metadata,
  });
};

// Helper: Track step completion
export const trackStepComplete = (step: number, metadata?: Record<string, any>): void => {
  trackFunnelEvent({
    event: 'funnel_step_completed',
    step,
    metadata,
  });
};

// Helper: Track choice made
export const trackChoice = (step: number, choice: string, metadata?: Record<string, any>): void => {
  trackFunnelEvent({
    event: 'funnel_choice_made',
    step,
    choice,
    metadata,
  });
};

// Helper: Track CTA click
export const trackCTAClick = (tier: string, url: string, step?: number): void => {
  trackFunnelEvent({
    event: 'funnel_cta_clicked',
    step,
    tier,
    url,
  });
};

// Helper: Track offer view
export const trackOfferView = (tier: string, step: number): void => {
  trackFunnelEvent({
    event: 'funnel_offer_viewed',
    step,
    tier,
  });
};

// Helper: Track offer decline
export const trackOfferDecline = (tier: string, step: number): void => {
  trackFunnelEvent({
    event: 'funnel_offer_declined',
    step,
    tier,
  });
};
