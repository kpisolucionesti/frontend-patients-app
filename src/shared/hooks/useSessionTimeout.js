import { useCallback, useEffect, useRef, useState } from 'react';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const WARNING_BEFORE_MS = 2 * 60 * 1000;
const WARNING_AT_MS = IDLE_TIMEOUT_MS - WARNING_BEFORE_MS;

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'wheel'];

const useSessionTimeout = (onExpired) => {
  const [warning, setWarning] = useState(false);
  const timerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const expiredRef = useRef(false);
  const lastActivityRef = useRef(Date.now());

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    timerRef.current = null;
    warningTimerRef.current = null;
  }, []);

  const startTimers = useCallback(() => {
    clearTimers();
    setWarning(false);
    expiredRef.current = false;

    warningTimerRef.current = setTimeout(() => {
      setWarning(true);
    }, WARNING_AT_MS);

    timerRef.current = setTimeout(() => {
      expiredRef.current = true;
      setWarning(false);
      onExpired?.();
    }, IDLE_TIMEOUT_MS);
  }, [clearTimers, onExpired]);

  const resetTimer = useCallback(() => {
    startTimers();
  }, [startTimers]);

  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (!expiredRef.current) {
      startTimers();
    }
  }, [startTimers]);

  useEffect(() => {
    startTimers();
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });
    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [startTimers, clearTimers, handleActivity]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) return;
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= IDLE_TIMEOUT_MS && !expiredRef.current) {
        expiredRef.current = true;
        setWarning(false);
        onExpired?.();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [onExpired]);

  return { warning, resetTimer };
};

export default useSessionTimeout;
