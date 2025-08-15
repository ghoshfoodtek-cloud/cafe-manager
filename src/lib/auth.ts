import { loadJSON, saveJSON } from "./storage";
import type { User } from "@/types/user";

// Simple user management for demo purposes
export const getCurrentUser = (): User | null => {
  return loadJSON<User | null>("currentUser", null);
};

export const setCurrentUser = (user: User | null): void => {
  saveJSON("currentUser", user);
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === "admin";
};

export const initializeDefaultAdmin = (): void => {
  const existingUser = getCurrentUser();
  if (!existingUser) {
    const adminUser: User = {
      id: crypto.randomUUID(),
      name: "Admin",
      role: "admin",
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(adminUser);
  }
};