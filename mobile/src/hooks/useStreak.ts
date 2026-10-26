import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = 'dnb-streak-count';
const LAST_OPEN_KEY = 'dnb-streak-last-open';

function daysBetween(a: string, b: string) {
  const diff = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

// Tracks consecutive-day app opens locally. Opening today after opening
// yesterday extends the streak; opening today after a gap resets it to 1.
export function useStreak() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [storedCount, lastOpen] = await Promise.all([
        AsyncStorage.getItem(STREAK_KEY),
        AsyncStorage.getItem(LAST_OPEN_KEY),
      ]);
      let count = storedCount ? parseInt(storedCount, 10) : 0;

      if (lastOpen === today) {
        // Already counted today.
      } else if (lastOpen && daysBetween(lastOpen, today) === 1) {
        count += 1;
      } else {
        count = 1;
      }

      await AsyncStorage.setItem(STREAK_KEY, String(count));
      await AsyncStorage.setItem(LAST_OPEN_KEY, today);
      setStreak(count);
    })();
  }, []);

  return streak;
}
