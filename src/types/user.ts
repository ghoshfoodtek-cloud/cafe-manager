export type User = {
  id: string;
  name: string;
  role: "admin" | "associate";
  createdAt: string;
  isActive?: boolean;
};

export type GlobalEvent = {
  id: string;
  timestamp: string;
  description: string;
  createdBy: string; // user name
  createdAt: string;
};