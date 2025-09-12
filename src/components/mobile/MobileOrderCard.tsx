import { ArrowRight, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SwipeableCard, SwipeAction } from './SwipeableCard';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Order } from '@/pages/Orders';
import { useAuth } from '@/components/auth/AuthContext';

interface MobileOrderCardProps {
  order: Order;
  onDelete: () => void;
  getStatusClass: (status: string) => string;
  formatStatus: (status: string) => string;
}

export const MobileOrderCard = ({
  order,
  onDelete,
  getStatusClass,
  formatStatus,
}: MobileOrderCardProps) => {
  const { canDelete } = useAuth();

  const swipeActions: SwipeAction[] = [
    {
      icon: <Eye className="h-5 w-5" />,
      label: 'View',
      action: () => window.location.href = `/orders/${order.id}`,
      variant: 'primary',
      side: 'right',
    },
  ];

  if (canDelete) {
    swipeActions.push({
      icon: <Trash2 className="h-5 w-5" />,
      label: 'Delete',
      action: onDelete,
      variant: 'destructive',
      side: 'left',
    });
  }

  return (
    <SwipeableCard actions={swipeActions}>
      <Card className="p-4 border-0 border-b border-border last:border-b-0 rounded-none">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base truncate mb-2">{order.title}</h3>
              <p className="text-sm text-muted-foreground">
                Created: {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 shrink-0"
              asChild
            >
              <Link to={`/orders/${order.id}`}>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline"
              className={getStatusClass(order.status)}
            >
              {formatStatus(order.status)}
            </Badge>
            
            <Link 
              to={`/orders/${order.id}`} 
              className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            >
              View timeline
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </Card>
    </SwipeableCard>
  );
};