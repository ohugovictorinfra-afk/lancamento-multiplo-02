import { useMemo } from 'react';
import { HEADLINES, type HeadlineVariant } from '@/lib/headlines';

const SESSION_KEY = 'headline_variant_id';

export function useHeadlineVariant(): HeadlineVariant {
  return useMemo(() => {
    const urlParam = new URLSearchParams(window.location.search).get('headline');

    if (urlParam) {
      const id = parseInt(urlParam, 10);
      const found = HEADLINES.find(h => h.id === id);
      if (found) {
        sessionStorage.setItem(SESSION_KEY, String(id));
        return found;
      }
    }

    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      const found = HEADLINES.find(h => h.id === parseInt(stored, 10));
      if (found) return found;
    }

    const random = HEADLINES[Math.floor(Math.random() * HEADLINES.length)];
    sessionStorage.setItem(SESSION_KEY, String(random.id));
    return random;
  }, []);
}
