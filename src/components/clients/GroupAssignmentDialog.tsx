import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, FolderPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContactGroups, createContactGroup } from "@/lib/supabase-groups";
import { updateClient } from "@/lib/supabase-clients";
import type { ExtClient } from "@/types/client";

interface GroupAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: ExtClient[];
  selectedClientIds: string[];
  onClientsUpdated: () => void;
}

export function GroupAssignmentDialog({
  open,
  onOpenChange,
  clients,
  selectedClientIds,
  onClientsUpdated,
}: GroupAssignmentDialogProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups = [] } = useQuery({
    queryKey: ["contactGroups"],
    queryFn: getContactGroups
  });

  const selectedClients = clients.filter(client => selectedClientIds.includes(client.id));
  const isBulkOperation = selectedClients.length > 1;

  useEffect(() => {
    if (open) {
      // If single client selection, set current group
      if (selectedClients.length === 1) {
        setSelectedGroupId(selectedClients[0].groupId || "none");
      } else {
        setSelectedGroupId("");
      }
    }
  }, [open, selectedClients]);

  const getCurrentGroupName = (client: ExtClient) => {
    if (!client.groupId) return "Unassigned";
    const group = groups.find(g => g.id === client.groupId);
    return group?.name || "Unknown Group";
  };

  const createGroupMutation = useMutation({
    mutationFn: createContactGroup,
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: ["contactGroups"] });
      setSelectedGroupId(newGroup.id);
      setIsCreatingGroup(false);
      setNewGroupName("");
      toast({
        title: "Group Created",
        description: `Group "${newGroup.name}" has been created successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ clientId, groupId }: { clientId: string; groupId: string | null }) =>
      updateClient(clientId, { groupId: groupId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    }
  });

  const handleCreateGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    createGroupMutation.mutate(name);
  };

  const handleAssignGroup = async () => {
    const groupIdToAssign = selectedGroupId === "none" ? null : selectedGroupId;
    
    try {
      await Promise.all(
        selectedClientIds.map(clientId =>
          updateClientMutation.mutateAsync({ clientId, groupId: groupIdToAssign })
        )
      );

      const groupName = selectedGroupId === "none" ? "Unassigned" : 
        groups.find(g => g.id === selectedGroupId)?.name || "Unknown";

      toast({
        title: isBulkOperation ? "Clients Updated" : "Client Updated",
        description: `${selectedClients.length} client${selectedClients.length > 1 ? 's' : ''} ${selectedGroupId === "none" ? 'removed from groups' : `assigned to "${groupName}"`}.`,
      });

      onClientsUpdated();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update clients. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setSelectedGroupId("");
    setIsCreatingGroup(false);
    setNewGroupName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isBulkOperation ? "Assign Clients to Group" : "Assign Client to Group"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected clients preview */}
          <div>
            <Label className="text-sm font-medium">
              Selected Client{selectedClients.length > 1 ? 's' : ''} ({selectedClients.length})
            </Label>
            <div className="mt-2 max-h-24 overflow-y-auto space-y-1">
              {selectedClients.map(client => (
                <div key={client.id} className="flex items-center justify-between text-sm p-2 bg-secondary/50 rounded">
                  <span className="font-medium">{client.fullName}</span>
                  <Badge variant="outline" className="text-xs">
                    {getCurrentGroupName(client)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Group selection */}
          {!isCreatingGroup ? (
            <>
              <div>
                <Label htmlFor="groupSelect">Assign to Group</Label>
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger id="groupSelect">
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                        Unassigned
                      </div>
                    </SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          {group.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                onClick={() => setIsCreatingGroup(true)}
                className="w-full"
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Create New Group
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="newGroupName">New Group Name</Label>
                <Input
                  id="newGroupName"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()}>
                  Create Group
                </Button>
                <Button variant="outline" onClick={() => setIsCreatingGroup(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignGroup} 
            disabled={!selectedGroupId || isCreatingGroup}
          >
            {isBulkOperation ? `Assign ${selectedClients.length} Clients` : 'Assign Client'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}