import { useState, useEffect } from 'react';

export function useGuestId() {
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    // Check if running in browser
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('guest_id');
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('guest_id', id);
      }
      setGuestId(id);
    }
  }, []);

  return guestId;
}
