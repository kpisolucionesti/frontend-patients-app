import { useEffect, useRef } from 'react';

export function usePolling(callback, intervalMs = 5000) {
  const savedCallback = useRef(callback);
  const intervalRef = useRef(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      savedCallback.current();
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [intervalMs]);
}
