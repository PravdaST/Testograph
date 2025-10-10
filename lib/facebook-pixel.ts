/**
 * Analytics Tracking Helper
 * Centralized tracking for Facebook Pixel and Google Analytics events
 */

// Extend Window interface for fbq and gtag
declare global {
  interface Window {
    fbq: any;
    gtag: any;
  }
}

/**
 * Track Google Analytics event
 * @param eventName - GA4 event name
 * @param params - Event parameters
 */
export const gtagTrack = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', eventName, params);
      console.log(`📊 GA4: ${eventName}`, params);
    } catch (error) {
      console.error('GA4 tracking error:', error);
    }
  }
};

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
 * Sends to both Facebook Pixel and Google Analytics
 */
export const trackLead = (contentName: string, value?: number) => {
  // Facebook Pixel
  fbqTrack('Lead', {
    content_name: contentName,
    content_category: 'Health Assessment',
    value: value || 0,
    currency: 'BGN'
  });

  // Google Analytics
  gtagTrack('generate_lead', {
    content_name: contentName,
    content_category: 'Health Assessment',
    value: value || 0,
    currency: 'BGN'
  });
};

/**
 * Track ViewContent event (page/step view)
 * Sends to both Facebook Pixel and Google Analytics
 */
export const trackViewContent = (contentName: string, contentType?: string) => {
  // Facebook Pixel
  fbqTrack('ViewContent', {
    content_name: contentName,
    content_type: contentType || 'product',
  });

  // Google Analytics
  gtagTrack('view_item', {
    item_name: contentName,
    item_category: contentType || 'product',
  });
};

/**
 * Track AddToCart event (viewing product offer)
 * Sends to both Facebook Pixel and Google Analytics
 */
export const trackAddToCart = (productName: string, value: number, currency: string = 'BGN') => {
  // Facebook Pixel
  fbqTrack('AddToCart', {
    content_name: productName,
    value: value,
    currency: currency,
  });

  // Google Analytics
  gtagTrack('add_to_cart', {
    items: [{
      item_name: productName,
      price: value,
    }],
    value: value,
    currency: currency,
  });
};

/**
 * Track InitiateCheckout event (clicking "Order Now")
 * Sends to both Facebook Pixel and Google Analytics
 */
export const trackInitiateCheckout = (productName: string, value: number, currency: string = 'BGN') => {
  // Facebook Pixel
  fbqTrack('InitiateCheckout', {
    content_name: productName,
    value: value,
    currency: currency,
  });

  // Google Analytics
  gtagTrack('begin_checkout', {
    items: [{
      item_name: productName,
      price: value,
    }],
    value: value,
    currency: currency,
  });
};
