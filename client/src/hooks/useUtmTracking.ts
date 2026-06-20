import { useEffect } from 'react';
import { useLocation } from 'wouter';

function getParam(name: string, url?: string): string | null {
  const href = url ?? window.location.href;
  const escaped = name.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + escaped + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(href);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function setCookie(name: string, value: string, seconds: number) {
  const date = new Date();
  date.setTime(date.getTime() + seconds * 1000);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
}

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift() ?? null;
  return null;
}

function applyUtmTracking() {
  const AD_PARAMS = ['fbclid', 'gclid'];
  const urlParams = new URLSearchParams(window.location.search);
  const referrerParams = new URLSearchParams(document.referrer.split('?')[1] ?? '');

  // Salva UTMs em cookie se vier de anúncio
  const isAdClick = AD_PARAMS.some(p => urlParams.has(p));
  if (isAdClick) {
    const map: Record<string, string> = {
      cookieUtmSource: getParam('utm_source') ?? '',
      cookieUtmMedium: getParam('utm_medium') ?? '',
      cookieUtmCampaign: getParam('utm_campaign') ?? '',
      cookieUtmContent: getParam('utm_content') ?? '',
      cookieUtmTerm: getParam('utm_term') ?? '',
    };
    Object.entries(map).forEach(([key, val]) => {
      if (val) setCookie(key, val, 63072000); // 2 anos
    });
  }

  // Coleta UTMs da URL atual, referrer ou fallback
  const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
  const utms: Record<string, string> = {};
  UTM_KEYS.forEach(key => {
    if (key === 'utm_source') {
      utms[key] =
        urlParams.get(key) ??
        (document.referrer
          ? (referrerParams.get(key) ?? new URL(document.referrer).hostname)
          : 'direto');
    } else {
      utms[key] = urlParams.get(key) ?? referrerParams.get(key) ?? '';
    }
  });

  const scksFromUrl = urlParams.get('sck')?.split('|') ?? [];
  const scks = Object.values(utms)
    .filter(v => v !== '')
    .filter(v => !scksFromUrl.includes(v));

  const cookieSource = getCookie('cookieUtmSource');
  const cookieMedium = getCookie('cookieUtmMedium');
  const cookieCampaign = getCookie('cookieUtmCampaign');
  const cookieContent = getCookie('cookieUtmContent');
  const cookieTerm = getCookie('cookieUtmTerm');
  const srcValues = [cookieSource, cookieMedium, cookieCampaign, cookieContent, cookieTerm].filter(
    (v): v is string => v !== null && v !== ''
  );

  // Aplica nos links
  document.querySelectorAll<HTMLAnchorElement>('a').forEach(el => {
    try {
      const elURL = new URL(el.href, window.location.origin);
      if (elURL.hash) return;

      const p = new URLSearchParams(elURL.search);
      let modified = false;

      // Preserva params existentes da LP
      urlParams.forEach((val, key) => {
        if (!p.has(key)) { p.append(key, val); modified = true; }
      });

      // Adiciona UTMs coletados
      Object.entries(utms).forEach(([key, val]) => {
        if (val && !p.has(key)) { p.append(key, val); modified = true; }
      });

      // Adiciona cookies de UTM
      if (cookieSource) p.append('cookieUtmSource', cookieSource);
      if (cookieMedium) p.append('cookieUtmMedium', cookieMedium);
      if (cookieCampaign) p.append('cookieUtmCampaign', cookieCampaign);
      if (cookieContent) p.append('cookieUtmContent', cookieContent);
      if (cookieTerm) p.append('cookieUtmTerm', cookieTerm);

      // sck e src
      if (!p.has('sck') && scks.length > 0) { p.append('sck', scks.join('|')); modified = true; }
      if (!p.has('src') && srcValues.length > 0) { p.append('src', srcValues.join('|')); modified = true; }

      if (modified) {
        el.href = `${elURL.origin}${elURL.pathname}?${p.toString()}`;
      }
    } catch {
      // ignora links inválidos
    }
  });
}

export function useUtmTracking() {
  const [location] = useLocation();

  useEffect(() => {
    // setTimeout(0) garante que o React já renderizou todos os links antes de modificar
    const id = setTimeout(applyUtmTracking, 0);
    return () => clearTimeout(id);
  }, [location]);
}
