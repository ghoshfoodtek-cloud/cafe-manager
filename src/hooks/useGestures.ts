import { useGesture } from '@use-gesture/react';
import { useSpring } from '@react-spring/web';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useCallback } from 'react';

export interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export interface SwipeOptions {
  threshold?: number;
  hapticFeedback?: boolean;
  enableHorizontal?: boolean;
  enableVertical?: boolean;
}

export const useSwipeGestures = (
  callbacks: SwipeCallbacks,
  options: SwipeOptions = {}
) => {
  const {
    threshold = 50,
    hapticFeedback = true,
    enableHorizontal = true,
    enableVertical = true,
  } = options;

  const triggerHaptic = useCallback(async () => {
    if (hapticFeedback) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (error) {
        // Haptics not available, continue silently
      }
    }
  }, [hapticFeedback]);

  const bind = useGesture({
    onDrag: ({ movement: [mx, my], direction: [dx, dy], velocity, last }) => {
      if (!last) return;

      const isHorizontal = Math.abs(mx) > Math.abs(my);
      const distance = Math.sqrt(mx * mx + my * my);

      if (distance < threshold) return;

      if (isHorizontal && enableHorizontal) {
        if (dx > 0 && callbacks.onSwipeRight) {
          triggerHaptic();
          callbacks.onSwipeRight();
        } else if (dx < 0 && callbacks.onSwipeLeft) {
          triggerHaptic();
          callbacks.onSwipeLeft();
        }
      } else if (!isHorizontal && enableVertical) {
        if (dy > 0 && callbacks.onSwipeDown) {
          triggerHaptic();
          callbacks.onSwipeDown();
        } else if (dy < 0 && callbacks.onSwipeUp) {
          triggerHaptic();
          callbacks.onSwipeUp();
        }
      }
    },
  });

  return bind;
};

export const useSwipeAnimation = (initialX = 0) => {
  const [{ x }, api] = useSpring(() => ({ x: initialX }));

  const handlers = useGesture({
    onDrag: ({ movement: [mx], down }) => {
      api.start({ x: down ? mx : 0, immediate: down });
    },
  });

  return { x, handlers, reset: () => api.start({ x: 0 }) };
};

export const usePullToRefresh = (onRefresh: () => Promise<void> | void) => {
  const [{ y }, api] = useSpring(() => ({ y: 0 }));

  const handlers = useGesture({
    onDrag: ({ movement: [, my], direction: [, dy], last, velocity }) => {
      if (my < 0) return; // Only allow pull down

      if (last) {
        if (my > 80 && dy > 0) {
          api.start({ y: 60 });
          Promise.resolve(onRefresh()).finally(() => {
            api.start({ y: 0 });
          });
        } else {
          api.start({ y: 0 });
        }
      } else {
        const clampedY = Math.min(my, 120);
        api.start({ y: clampedY });
      }
    },
  });

  return { y, handlers };
};