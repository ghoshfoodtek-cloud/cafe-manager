import { ReactNode, useState } from 'react';
import { animated } from '@react-spring/web';
import { cn } from '@/lib/utils';
import { useSwipeAnimation } from '@/hooks/useGestures';
import { Button } from '@/components/ui/button';

export interface SwipeAction {
  icon: ReactNode;
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive' | 'primary';
  side: 'left' | 'right';
}

interface SwipeableCardProps {
  children: ReactNode;
  actions?: SwipeAction[];
  className?: string;
  threshold?: number;
}

export const SwipeableCard = ({ 
  children, 
  actions = [], 
  className,
  threshold = 80 
}: SwipeableCardProps) => {
  const [activeAction, setActiveAction] = useState<SwipeAction | null>(null);
  const { x, handlers, reset } = useSwipeAnimation();

  const leftActions = actions.filter(action => action.side === 'left');
  const rightActions = actions.filter(action => action.side === 'right');

  const handleSwipe = (direction: 'left' | 'right') => {
    const relevantActions = direction === 'left' ? rightActions : leftActions;
    if (relevantActions.length > 0) {
      setActiveAction(relevantActions[0]);
    }
  };

  const executeAction = () => {
    if (activeAction) {
      activeAction.action();
      setActiveAction(null);
      reset();
    }
  };

  const cancelAction = () => {
    setActiveAction(null);
    reset();
  };

  const getActionVariantClasses = (variant?: string) => {
    switch (variant) {
      case 'destructive':
        return 'bg-destructive text-destructive-foreground';
      case 'primary':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center">
          {leftActions.map((action, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-center w-20 h-full",
                getActionVariantClasses(action.variant)
              )}
            >
              {action.icon}
            </div>
          ))}
        </div>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center">
          {rightActions.map((action, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-center w-20 h-full",
                getActionVariantClasses(action.variant)
              )}
            >
              {action.icon}
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <animated.div
        style={{ x }}
        className={cn("relative bg-background", className)}
        onTouchStart={handlers.onTouchStart}
        onTouchMove={handlers.onTouchMove}
        onTouchEnd={(e) => {
          handlers.onTouchEnd?.(e);
          const currentX = x.get();
          if (Math.abs(currentX) > threshold) {
            handleSwipe(currentX > 0 ? 'right' : 'left');
          } else {
            reset();
          }
        }}
      >
        {children}
      </animated.div>

      {/* Action Confirmation */}
      {activeAction && (
        <div className="absolute inset-0 bg-background/95 flex items-center justify-center gap-4 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={cancelAction}
          >
            Cancel
          </Button>
          <Button
            variant={activeAction.variant === 'destructive' ? 'destructive' : 'default'}
            size="sm"
            onClick={executeAction}
          >
            {activeAction.label}
          </Button>
        </div>
      )}
    </div>
  );
};