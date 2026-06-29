import { useEffect } from 'react';

const CHECKOUT_HOST = 'pay.onprofit.com.br';

// Único listener instalado uma vez; re-instalar em cada render seria ineficiente
let interceptorInstalled = false;

function getParam(name: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, seconds: number) {
  const date = new Date();
  date.setTime(date.getTime() + seconds * 1000);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
}

function collectUtmData() {
  const urlParams = new URLSearchParams(window.location.search);
  const referrerParams = new URLSearchParams(document.referrer.split('?')[1] ?? '');

  // Persiste UTMs em cookie se veio de anúncio
  const isAdClick = urlParams.has('fbclid') || urlParams.has('gclid');
  if (isAdClick) {
    const map: Record<string, string | null> = {
      cookieUtmSource: getParam('utm_source'),
      cookieUtmMedium: getParam('utm_medium'),
      cookieUtmCampaign: getParam('utm_campaign'),
      cookieUtmContent: getParam('utm_content'),
      cookieUtmTerm: getParam('utm_term'),
    };
    Object.entries(map).forEach(([key, val]) => {
      if (val) setCookie(key, val, 63072000);
    });
  }

  const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
  const utms: Record<string, string> = {};
  UTM_KEYS.forEach(key => {
    if (key === 'utm_source') {
      utms[key] =
        urlParams.get(key) ??
        (document.referrer
          ? (referrerParams.get(key) ?? (() => { try { return new URL(document.referrer).hostname; } catch { return 'direto'; } })())
          : 'direto');
    } else {
      utms[key] = urlParams.get(key) ?? referrerParams.get(key) ?? '';
    }
  });

  const scksFromUrl = urlParams.get('sck')?.split('|') ?? [];
  const scks = Object.values(utms).filter(v => v !== '').filter(v => !scksFromUrl.includes(v));

  const cookieSource = getCookie('cookieUtmSource');
  const cookieMedium = getCookie('cookieUtmMedium');
  const cookieCampaign = getCookie('cookieUtmCampaign');
  const cookieContent = getCookie('cookieUtmContent');
  const cookieTerm = getCookie('cookieUtmTerm');
  const srcValues = [cookieSource, cookieMedium, cookieCampaign, cookieContent, cookieTerm]
    .filter((v): v is string => v !== null && v !== '');

  return { urlParams, utms, scks, srcValues, cookieSource, cookieMedium, cookieCampaign, cookieContent, cookieTerm };
}

function buildCheckoutUrl(originalUrl: URL): string {
  const { urlParams, utms, scks, srcValues, cookieSource, cookieMedium, cookieCampaign, cookieContent, cookieTerm } =
    collectUtmData();

  const p = new URLSearchParams(originalUrl.search);

  // Params da LP atual
  urlParams.forEach((val, key) => {
    if (!p.has(key)) p.append(key, val);
  });

  // UTMs coletados
  Object.entries(utms).forEach(([key, val]) => {
    if (val && !p.has(key)) p.append(key, val);
  });

  // Cookies de UTM
  if (cookieSource) p.append('cookieUtmSource', cookieSource);
  if (cookieMedium) p.append('cookieUtmMedium', cookieMedium);
  if (cookieCampaign) p.append('cookieUtmCampaign', cookieCampaign);
  if (cookieContent) p.append('cookieUtmContent', cookieContent);
  if (cookieTerm) p.append('cookieUtmTerm', cookieTerm);

  if (!p.has('sck') && scks.length > 0) p.append('sck', scks.join('|'));
  if (!p.has('src') && srcValues.length > 0) p.append('src', srcValues.join('|'));

  const headlineVariant = sessionStorage.getItem('headline_variant_id');
  if (headlineVariant && !p.has('hv')) p.append('hv', headlineVariant);

  return `${originalUrl.origin}${originalUrl.pathname}?${p.toString()}`;
}

function installInterceptor() {
  if (interceptorInstalled) return;
  interceptorInstalled = true;

  // Fase de captura: roda ANTES do React processar o onClick e ANTES do browser abrir a aba
  document.addEventListener(
    'click',
    (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null;
      if (!link?.href) return;

      try {
        const url = new URL(link.href);
        // Só intercepta links do checkout
        if (!url.hostname.includes(CHECKOUT_HOST)) return;
        if (url.hash) return;

        const newHref = buildCheckoutUrl(url);
        if (newHref !== link.href) {
          // Modifica o href antes do browser processar o clique.
          // Para target="_blank", o browser já usou o href ao iniciar a abertura da aba —
          // precisamos abrir manualmente e cancelar o default.
          e.preventDefault();
          window.open(newHref, link.target || '_blank', 'noopener,noreferrer');
        }
      } catch {
        // ignora links inválidos
      }
    },
    true, // capture phase
  );
}

export function useUtmTracking() {
  useEffect(() => {
    installInterceptor();
  }, []);
}
