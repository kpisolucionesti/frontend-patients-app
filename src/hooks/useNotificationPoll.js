import { useState, useEffect, useRef, useCallback } from 'react';
import { BackendAPI } from '../services/BackendApi';

const POLL_INTERVAL = 20000;

export default function useNotificationPoll() {
  const [notifications, setNotifications] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const lastPollRef = useRef(null);
  const intervalRef = useRef(null);

  const fetch = useCallback(async () => {
    try {
      const params = {};
      if (lastPollRef.current) {
        params.since = lastPollRef.current;
      }
      const data = await BackendAPI.notifications.getAll(params);
      if (Array.isArray(data) && data.length > 0) {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const fresh = data.filter((n) => !existingIds.has(n.id));
          if (fresh.length > 0) {
            setNewItems((q) => [...q, ...fresh]);
          }
          return [...fresh, ...prev];
        });
      }
      if (Array.isArray(data) && data.length > 0) {
        lastPollRef.current = data[0].created_at;
      } else if (!lastPollRef.current) {
        lastPollRef.current = new Date().toISOString();
      }
    } catch {
      // ignore
    }
  }, []);

  const dequeueNew = useCallback(() => {
    const item = newItems.length > 0 ? newItems[0] : null;
    if (item) {
      setNewItems((q) => q.slice(1));
    }
    return item;
  }, [newItems]);

  const markRead = useCallback(async (id) => {
    try {
      await BackendAPI.notifications.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      // ignore
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await BackendAPI.notifications.markAllRead();
      setNotifications([]);
      setNewItems([]);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetch();
    intervalRef.current = setInterval(fetch, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetch]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, newItems, dequeueNew, markRead, markAllRead, fetch };
}
