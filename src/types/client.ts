export type Client = {
  id: string;
  fullName: string;
  age?: number;
  phones: string[];
  address?: string;
  city?: string;
  village?: string;
  block?: string;
  createdAt: string;
  profilePhoto?: string; // base64 or URL
};

// Extended client fields for advanced client management
export type ExtClient = Client & {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  profession?: string;
  qualifications?: string; // comma separated
  email?: string;
  company?: string;
  groupId?: string; // family group id
};

export type ContactGroup = {
  id: string;
  name: string;
};