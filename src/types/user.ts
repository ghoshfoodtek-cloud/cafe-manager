export type User = {
  id: string;
  name: string;
  role: "admin" | "user";
  createdAt: string;
};

export type GlobalEvent = {
  id: string;
  timestamp: string;
  description: string;
  createdBy: string; // user name
  createdAt: string;
};