import { useCallback, useEffect, useRef, useState } from 'react';
import { dynamicSettingsApi } from '../entities/dynamic-setting/api';

const DEFAULT_IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const WARNING_BEFORE_MS = 2 * 60 * 1000;

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'wheel'];

const useSessionTimeout = (onExpired) => {
  const [warning, setWarning] = useState(false);
  const [idleTimeoutMs, setIdleTimeoutMs] = useState(DEFAULT_IDLE_TIMEOUT_MS);
  const timerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const expiredRef = useRef(false);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    dynamicSettingsApi.show('seguridad')
      .then((data) => {
        const minutes = data.settings_data?.idle_timeout_minutes;
        if (minutes && Number(minutes) > 0) {
          setIdleTimeoutMs(Number(minutes) * 60 * 1000);
        }
      })
      .catch(() => { /* fallback to default */ });
  }, []);

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

    const warningAt = idleTimeoutMs - WARNING_BEFORE_MS;

    warningTimerRef.current = setTimeout(() => {
      setWarning(true);
    }, warningAt);

    timerRef.current = setTimeout(() => {
      expiredRef.current = true;
      setWarning(false);
      onExpired?.();
    }, idleTimeoutMs);
  }, [clearTimers, onExpired, idleTimeoutMs]);

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
      if (elapsed >= idleTimeoutMs && !expiredRef.current) {
        expiredRef.current = true;
        setWarning(false);
        onExpired?.();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [onExpired, idleTimeoutMs]);

  return { warning, resetTimer };
};

export default useSessionTimeout;
