import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Phone,
  Notebook,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  List as ListIcon,
  LayoutGrid,
  Rows3,
  FolderPlus,
  Users,
  UserPlus,
  X,
} from "lucide-react";
import { loadJSON, saveJSON } from "@/lib/storage";
import type { Client, ExtClient, ContactGroup } from "@/types/client";
import InCallSheet from "@/components/calls/InCallSheet";
import { GroupAssignmentDialog } from "@/components/clients/GroupAssignmentDialog";
import { useAuth } from "@/components/auth/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Extended client fields for Contacts without breaking other pages

const GROUPS_KEY = "contactGroups";
const LAYOUT_KEY = "contactsLayout";

const ClientList = () => {
  const [clients, setClients] = useState<ExtClient[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{ client: ExtClient | null; phone: string | null }>({ client: null, phone: null });
  const [open, setOpen] = useState(false);
  const { canDelete } = useAuth();

  const [layout, setLayout] = useState<"list" | "grid" | "compact">(
    (localStorage.getItem(LAYOUT_KEY) as any) || "list"
  );
  const [groups, setGroups] = useState<ContactGroup[]>(loadJSON<ContactGroup[]>(GROUPS_KEY, []));
  const [groupFilter, setGroupFilter] = useState<string>("all");

  // Bulk selection
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ExtClient | null>(null);

  // New group dialog
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // Group assignment dialog
  const [groupAssignmentOpen, setGroupAssignmentOpen] = useState(false);

  // Refresh client list when component mounts or when returning from edit
  useEffect(() => {
    const refreshClients = () => {
      const clients = loadJSON<ExtClient[]>("clients", []);
      setClients(clients);
    };

    refreshClients();

    // Listen for storage changes to refresh when data is updated
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "clients") {
        refreshClients();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also refresh when tab becomes visible (user returns from edit)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshClients();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Cleanup: Close InCallSheet when component unmounts to prevent scroll lock
  useEffect(() => {
    return () => {
      setOpen(false);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(LAYOUT_KEY, layout);
  }, [layout]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return loadClientsForFilter(clients, q, groupFilter);
  }, [clients, query, groupFilter]);

  const getGroupName = (groupId?: string) => {
    if (!groupId) return "Unassigned";
    const group = groups.find(g => g.id === groupId);
    return group?.name || "Unknown";
  };

  const getGroupColor = (groupId?: string) => {
    if (!groupId) return "bg-muted text-muted-foreground";
    return "bg-primary/10 text-primary";
  };

  const handleBulkSelect = (clientId: string, checked: boolean) => {
    setSelectedClientIds(prev => 
      checked 
        ? [...prev, clientId] 
        : prev.filter(id => id !== clientId)
    );
  };

  const handleSelectAll = () => {
    setSelectedClientIds(selectedClientIds.length === filtered.length ? [] : filtered.map(c => c.id));
  };

  const handleBulkGroupAssignment = () => {
    setGroupAssignmentOpen(true);
  };

  const clearSelection = () => {
    setSelectedClientIds([]);
  };

  const handleSingleGroupAssignment = (clientId: string) => {
    setSelectedClientIds([clientId]);
    setGroupAssignmentOpen(true);
  };

  function displayName(c: ExtClient) {
    const name = [c.firstName, c.middleName, c.lastName].filter(Boolean).join(" ");
    return name || c.fullName;
  }

  const openCall = (client: ExtClient, phone: string) => {
    setSelected({ client, phone });
    setOpen(true);
  };

  function handleDelete(client: ExtClient) {
    setToDelete(client);
    setDeleteOpen(true);
  }

  function normalizeClient(c: ExtClient): ExtClient {
    const full = [c.firstName, c.middleName, c.lastName].filter(Boolean).join(" ");
    return { ...c, fullName: full || c.fullName };
  }

  function confirmDelete() {
    if (!toDelete) return;
    const next = clients.filter((c) => c.id !== toDelete.id);
    setClients(next);
    saveJSON("clients", next);
    setDeleteOpen(false);
    setToDelete(null);
  }

  function createGroup() {
    const name = newGroupName.trim();
    if (!name) return;
    const group: ContactGroup = { id: `grp_${Date.now()}`, name };
    const next = [...groups, group];
    setGroups(next);
    saveJSON(GROUPS_KEY, next);
    setGroupDialogOpen(false);
    setNewGroupName("");
  }

  return (
    <main className="container mx-auto py-6">
      <Helmet>
        <title>Clients | Bharat Connect Pro</title>
        <meta name="description" content="Manage client contacts with quick call, logs, notes, and productivity tools." />
        <link rel="canonical" href="/clients" />
      </Helmet>

      <section className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <div className="flex items-center gap-1">
          <Button
            variant={layout === "list" ? "secondary" : "ghost"}
            size="icon"
            aria-label="List layout"
            onClick={() => setLayout("list")}
            title="List layout"
          >
            <ListIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === "grid" ? "secondary" : "ghost"}
            size="icon"
            aria-label="Grid layout"
            onClick={() => setLayout("grid")}
            title="Grid layout"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === "compact" ? "secondary" : "ghost"}
            size="icon"
            aria-label="Compact layout"
            onClick={() => setLayout("compact")}
            title="Compact layout"
          >
            <Rows3 className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, city, address, profession..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger aria-label="Filter by group">
              <SelectValue placeholder="All groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All groups</SelectItem>
              <SelectItem value="none">Unassigned</SelectItem>
              {groups.map((g) => (
                <SelectItem key={g.id} value={g.id}>{g.name} ({clients.filter(c => c.groupId === g.id).length})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setGroupDialogOpen(true)}>
            <FolderPlus className="h-4 w-4 mr-2" /> New Group
          </Button>
        </div>
      </section>

      {/* Bulk Actions Bar */}
      {selectedClientIds.length > 0 && (
        <section className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {selectedClientIds.length} client{selectedClientIds.length > 1 ? 's' : ''} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkGroupAssignment}
              >
                <Users className="h-4 w-4 mr-2" />
                Assign to Group
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Selection
            </Button>
          </div>
        </section>
      )}

      {/* Select All Checkbox */}
      {filtered.length > 0 && (
        <section className="mb-4 flex items-center gap-2">
          <Checkbox
            id="selectAll"
            checked={selectedClientIds.length === filtered.length}
            onCheckedChange={handleSelectAll}
          />
          <Label htmlFor="selectAll" className="text-sm">
            Select all {filtered.length} client{filtered.length > 1 ? 's' : ''}
          </Label>
        </section>
      )}

      {filtered.length === 0 ? (
        <Card className="p-6 text-muted-foreground">No clients found.</Card>
      ) : layout === "grid" ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <li key={c.id} className="rounded-md border p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedClientIds.includes(c.id)}
                    onCheckedChange={(checked) => handleBulkSelect(c.id, checked as boolean)}
                  />
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary font-medium">
                    {displayName(c)
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="font-medium">{displayName(c)}</div>
                    <div className="text-sm text-muted-foreground">{c.phones[0] || "No phone"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.phones[0] && (
                    <Button size="icon" onClick={() => openCall(c, c.phones[0])} aria-label="Call">
                      <Phone className="h-4 w-4" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" aria-label="More options">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/clients/${c.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSingleGroupAssignment(c.id)}>
                      <UserPlus className="mr-2 h-4 w-4" /> Assign to Group
                    </DropdownMenuItem>
                    {canDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(c)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Button size="sm" variant="outline" onClick={() => openCall(c, c.phones[0] || "")}>
                  <Notebook className="mr-2 h-4 w-4" /> Notes
                </Button>
                <Badge variant="outline" className={`text-xs ${getGroupColor(c.groupId)}`}>
                  {getGroupName(c.groupId)}
                </Badge>
              </div>
              {c.company && (
                <div className="mt-3 text-sm text-muted-foreground">{c.company}</div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="divide-y rounded-md border">
          {filtered.map((c) => (
            <li key={c.id} className={`flex items-center justify-between p-3 ${layout === "compact" ? "py-2" : "py-3"}`}>
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedClientIds.includes(c.id)}
                  onCheckedChange={(checked) => handleBulkSelect(c.id, checked as boolean)}
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary font-medium">
                  {displayName(c)
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{displayName(c)}</span>
                    <Badge variant="outline" className={`text-xs ${getGroupColor(c.groupId)}`}>
                      {getGroupName(c.groupId)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{c.phones[0] || "No phone"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {c.phones[0] && (
                  <Button size="icon" onClick={() => openCall(c, c.phones[0])} aria-label="Call">
                    <Phone className="h-4 w-4" />
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => openCall(c, c.phones[0] || "") }>
                  <Notebook className="mr-2 h-4 w-4" /> Notes
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" aria-label="More options">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/clients/${c.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSingleGroupAssignment(c.id)}>
                        <UserPlus className="mr-2 h-4 w-4" /> Assign to Group
                      </DropdownMenuItem>
                      {canDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(c)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>
      )}

      <InCallSheet open={open} onOpenChange={setOpen} client={selected.client as Client} phone={selected.phone} />

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete client?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client and remove it from your local storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New group dialog */}
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new group</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label htmlFor="groupName">Group name</Label>
              <Input id="groupName" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>Cancel</Button>
              <Button onClick={createGroup}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Group Assignment Dialog */}
      <GroupAssignmentDialog
        open={groupAssignmentOpen}
        onOpenChange={(open) => {
          setGroupAssignmentOpen(open);
          if (!open) {
            setSelectedClientIds([]);
          }
        }}
        clients={clients}
        selectedClientIds={selectedClientIds}
        onClientsUpdated={(updatedClients) => {
          setClients(updatedClients);
          setSelectedClientIds([]);
        }}
      />
    </main>
  );
};

function loadClientsForFilter(clients: ExtClient[], q: string, groupFilter: string) {
  let list = clients;
  if (q) {
    list = list.filter((c) =>
      (c.fullName?.toLowerCase().includes(q) || false) ||
      [c.firstName, c.middleName, c.lastName].filter(Boolean).join(" ").toLowerCase().includes(q) ||
      (c.email?.toLowerCase().includes(q) || false) ||
      (c.company?.toLowerCase().includes(q) || false) ||
      (c.address?.toLowerCase().includes(q) || false) ||
      (c.city?.toLowerCase().includes(q) || false) ||
      (c.village?.toLowerCase().includes(q) || false) ||
      (c.block?.toLowerCase().includes(q) || false) ||
      (c.profession?.toLowerCase().includes(q) || false) ||
      (c.qualifications?.toLowerCase().includes(q) || false) ||
      (c.age?.toString().includes(q) || false) ||
      c.phones?.some((p) => p.toLowerCase().includes(q))
    );
  }
  if (groupFilter !== "all") {
    if (groupFilter === "none") {
      list = list.filter((c) => !c.groupId);
    } else {
      list = list.filter((c) => c.groupId === groupFilter);
    }
  }
  return list;
}

export default ClientList;
