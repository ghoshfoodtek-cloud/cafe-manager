import { ReactNode } from 'react';
import { animated } from '@react-spring/web';
import { usePullToRefresh } from '@/hooks/useGestures';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  className?: string;
}

export const PullToRefresh = ({ 
  children, 
  onRefresh, 
  className 
}: PullToRefreshProps) => {
  const { y, handlers } = usePullToRefresh(onRefresh);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Pull indicator */}
      <animated.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-background/95 backdrop-blur z-10"
        style={{
          height: y,
          opacity: y.to([0, 60], [0, 1]),
        }}
      >
        <animated.div
          style={{
            transform: y.to(val => `rotate(${val * 6}deg)`),
          }}
        >
          <RefreshCw className="h-5 w-5 text-primary" />
        </animated.div>
      </animated.div>

      {/* Content */}
      <animated.div
        style={{
          transform: y.to(val => `translateY(${val}px)`),
        }}
        className="min-h-full"
        {...(handlers as any)}
      >
        {children}
      </animated.div>
    </div>
  );
};