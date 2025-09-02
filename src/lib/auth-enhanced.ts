import { loadJSON, saveJSON } from "./storage";
import type { User } from "@/types/user";

// Enhanced multi-user authentication system
export const getCurrentUser = (): User | null => {
  return loadJSON<User | null>("currentUser", null);
};

export const getAllUsers = (): User[] => {
  return loadJSON<User[]>("allUsers", []);
};

export const setCurrentUser = (user: User | null): void => {
  saveJSON("currentUser", user);
};

export const addUser = (user: User): void => {
  const users = getAllUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  saveJSON("allUsers", users);
};

export const updateUser = (userId: string, updates: Partial<User>): boolean => {
  const users = getAllUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex >= 0) {
    users[userIndex] = { ...users[userIndex], ...updates };
    saveJSON("allUsers", users);
    
    // Update current user if it's the one being updated
    const currentUser = getCurrentUser();
    if (currentUser?.id === userId) {
      setCurrentUser(users[userIndex]);
    }
    
    return true;
  }
  
  return false;
};

export const deactivateUser = (userId: string): boolean => {
  return updateUser(userId, { isActive: false });
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === "admin";
};

export const isAssociate = (): boolean => {
  const user = getCurrentUser();
  return user?.role === "associate";
};

export const canDelete = (): boolean => {
  return isAdmin();
};

export const canManageUsers = (): boolean => {
  return isAdmin();
};

export const logout = (): void => {
  setCurrentUser(null);
};

export const switchUser = (userId: string): boolean => {
  const users = getAllUsers();
  const user = users.find(u => u.id === userId && u.isActive !== false);
  
  if (user) {
    setCurrentUser(user);
    return true;
  }
  
  return false;
};

export const initializeUsers = (): void => {
  const users = getAllUsers();
  const currentUser = getCurrentUser();
  
  // Migrate existing single user system
  if (!users.length && !currentUser) {
    const adminUser: User = {
      id: crypto.randomUUID(),
      name: "Admin",
      role: "admin",
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    
    addUser(adminUser);
    setCurrentUser(adminUser);
  } else if (currentUser && !users.find(u => u.id === currentUser.id)) {
    // Migrate existing currentUser to allUsers
    const migratedUser = {
      ...currentUser,
      role: (currentUser.role as any) === "user" ? "associate" as const : currentUser.role,
      isActive: true,
    };
    addUser(migratedUser);
    setCurrentUser(migratedUser);
  }
};

export const createAssociate = (name: string): User => {
  const associate: User = {
    id: crypto.randomUUID(),
    name,
    role: "associate",
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  
  addUser(associate);
  return associate;
};