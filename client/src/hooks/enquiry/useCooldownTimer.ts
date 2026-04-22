import { useCallback, useEffect, useRef, useState } from 'react';

export function useCooldownTimer(durationSeconds: number = 10) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current != null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clear();
    setSecondsLeft(durationSeconds);
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clear();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clear, durationSeconds]);

  useEffect(() => clear, [clear]);

  return {
    isCoolingDown: secondsLeft > 0,
    secondsLeft,
    startCooldown: start,
    resetCooldown: () => setSecondsLeft(0),
  };
}

