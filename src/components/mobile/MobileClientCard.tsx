import { Phone, Edit, Trash2, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SwipeableCard, SwipeAction } from './SwipeableCard';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { ExtClient } from '@/types/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface MobileClientCardProps {
  client: ExtClient;
  onCall: (phone: string) => void;
  onDelete: () => void;
  onGroupAssign: () => void;
  getGroupName: (groupId?: string) => string;
  getGroupColor: (groupId?: string) => string;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
}

export const MobileClientCard = ({
  client,
  onCall,
  onDelete,
  onGroupAssign,
  getGroupName,
  getGroupColor,
  isSelected,
  onSelect,
}: MobileClientCardProps) => {
  const { canDelete } = useSupabaseAuth();

  const displayName = (c: ExtClient) => {
    const name = [c.firstName, c.middleName, c.lastName].filter(Boolean).join(" ");
    return name || c.fullName;
  };

  const swipeActions: SwipeAction[] = [
    {
      icon: <Phone className="h-5 w-5" />,
      label: 'Call',
      action: () => onCall(client.phones[0] || ''),
      variant: 'primary',
      side: 'right',
    },
    {
      icon: <UserPlus className="h-5 w-5" />,
      label: 'Group',
      action: onGroupAssign,
      variant: 'default',
      side: 'left',
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
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
          />
          
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary font-medium text-sm">
            {displayName(client)
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{displayName(client)}</h3>
              <Badge 
                variant="outline" 
                className={`text-xs shrink-0 ${getGroupColor(client.groupId)}`}
              >
                {getGroupName(client.groupId)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground truncate">
                {client.phones[0] || "No phone"}
              </p>
              
              <div className="flex items-center gap-1 shrink-0">
                {client.phones[0] && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onCall(client.phones[0])}
                    className="h-8 w-8 p-0"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  asChild
                >
                  <Link to={`/clients/${client.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            
            {client.company && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {client.company}
              </p>
            )}
          </div>
        </div>
      </Card>
    </SwipeableCard>
  );
};