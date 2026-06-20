import { useEffect } from 'react';

const PIXEL_ID = '647241233695896';
const EXTERNAL_ID_KEY = 'fb_external_id';

declare global {
  interface Window {
    fbq?: {
      (action: string, ...args: any[]): void;
      callMethod?: (...args: any[]) => void;
      push?: (...args: any[]) => void;
      loaded?: boolean;
      version?: string;
      queue?: any[];
    };
    _fbq?: any;
  }
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// ID estável por visitante — principal sinal de Advanced Matching sem email/telefone
function getOrCreateExternalId(): string {
  try {
    let id = localStorage.getItem(EXTERNAL_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(EXTERNAL_ID_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

// Constrói fbc do fbclid da URL caso o cookie _fbc ainda não exista
function getFbc(): string | null {
  const cookie = getCookie('_fbc');
  if (cookie) return cookie;
  const fbclid = new URLSearchParams(window.location.search).get('fbclid');
  if (fbclid) return `fb.1.${Math.floor(Date.now() / 1000)}.${fbclid}`;
  return null;
}

async function sendCapiEvent(
  eventName: string,
  eventId: string,
  customData?: Record<string, any>,
) {
  try {
    await fetch('/api/conversions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        event_source_url: window.location.href,
        client_user_agent: navigator.userAgent,
        fbp: getCookie('_fbp'),
        fbc: getFbc(),
        external_id: getOrCreateExternalId(),
        ...(customData ? { custom_data: customData } : {}),
      }),
    });
  } catch {
    // CAPI failure must not affect UX
  }
}

export const initFacebookPixel = () => {
  if (typeof window === 'undefined') return;
  if (window.fbq) return;

  const fbq = function (this: any, ...args: any[]) {
    if ((fbq as any).callMethod) {
      (fbq as any).callMethod.apply(fbq, args);
    } else {
      (fbq as any).queue.push(args);
    }
  } as any;

  window.fbq = fbq;
  window._fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  }

  const externalId = getOrCreateExternalId();
  const pageViewId = crypto.randomUUID();

  // Advanced Matching: passa external_id no init para o browser pixel
  window.fbq('init', PIXEL_ID, { external_id: externalId });
  window.fbq('track', 'PageView', {}, { eventID: pageViewId });

  // Aguarda 500ms para o fbevents.js criar o cookie _fbp antes de enviar via CAPI
  setTimeout(() => sendCapiEvent('PageView', pageViewId), 500);
};

export const useFacebookPixel = () => {
  useEffect(() => {
    const load = () => initFacebookPixel();
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(load, { timeout: 3000 });
    } else {
      setTimeout(load, 3000);
    }
  }, []);

  const trackEvent = (eventName: string, data?: Record<string, any>) => {
    const eventId = crypto.randomUUID();
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, data ?? {}, { eventID: eventId });
    }
    sendCapiEvent(eventName, eventId, data);
  };

  const trackPageView = () => {
    const eventId = crypto.randomUUID();
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView', {}, { eventID: eventId });
    }
    setTimeout(() => sendCapiEvent('PageView', eventId), 500);
  };

  const trackLead = (data?: Record<string, any>) => trackEvent('Lead', data);

  const trackPurchase = (value: number, currency: string = 'BRL') =>
    trackEvent('Purchase', { value, currency });

  const trackViewContent = (contentId: string, contentName: string) =>
    trackEvent('ViewContent', { content_id: contentId, content_name: contentName });

  const trackInitiateCheckout = (value: number, currency: string = 'BRL') =>
    trackEvent('InitiateCheckout', { value, currency });

  return {
    trackEvent,
    trackPageView,
    trackLead,
    trackPurchase,
    trackViewContent,
    trackInitiateCheckout,
  };
};
