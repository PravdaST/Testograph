/**
 * Facebook Pixel Tracking Helper
 * Centralized tracking for Facebook Pixel events
 */

// Extend Window interface for fbq
declare global {
  interface Window {
    fbq: any;
  }
}

/**
 * Track standard Facebook Pixel event
 * @param event - Standard event name (Lead, Purchase, ViewContent, etc.)
 * @param params - Optional event parameters
 */
export const fbqTrack = (event: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', event, params);
      console.log(`📊 FB Pixel: ${event}`, params);
    } catch (error) {
      console.error('FB Pixel tracking error:', error);
    }
  }
};

/**
 * Track custom Facebook Pixel event
 * @param event - Custom event name
 * @param params - Optional event parameters
 */
export const fbqTrackCustom = (event: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('trackCustom', event, params);
      console.log(`📊 FB Pixel Custom: ${event}`, params);
    } catch (error) {
      console.error('FB Pixel custom tracking error:', error);
    }
  }
};

/**
 * Track Lead event (form submission)
 */
export const trackLead = (contentName: string, value?: number) => {
  fbqTrack('Lead', {
    content_name: contentName,
    content_category: 'Health Assessment',
    value: value || 0,
    currency: 'BGN'
  });
};

/**
 * Track ViewContent event (page/step view)
 */
export const trackViewContent = (contentName: string, contentType?: string) => {
  fbqTrack('ViewContent', {
    content_name: contentName,
    content_type: contentType || 'product',
  });
};

/**
 * Track AddToCart event (viewing product offer)
 */
export const trackAddToCart = (productName: string, value: number, currency: string = 'BGN') => {
  fbqTrack('AddToCart', {
    content_name: productName,
    value: value,
    currency: currency,
  });
};

/**
 * Track InitiateCheckout event (clicking "Order Now")
 */
export const trackInitiateCheckout = (productName: string, value: number, currency: string = 'BGN') => {
  fbqTrack('InitiateCheckout', {
    content_name: productName,
    value: value,
    currency: currency,
  });
};
