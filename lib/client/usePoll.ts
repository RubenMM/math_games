'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from './api';

/** Polls `url` every `intervalMs` (paused while the tab is hidden or `enabled` is false). */
export function usePoll<T>(url: string, intervalMs: number, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      setData(await api<T>(url));
      setError(null);
    } catch (e) {
      setError(e as ApiError);
    } finally {
      inFlight.current = false;
    }
  }, [url]);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    const timer = setInterval(() => {
      if (!document.hidden) refresh();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [refresh, intervalMs, enabled]);

  return { data, error, refresh, setData };
}
