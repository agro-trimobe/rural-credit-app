export interface Document {
  id?: string;
  name: string;
  size: number;
  type: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PropertyLocation {
  latitude: number;
  longitude: number;
}

export interface Project {
  id: string;
  clientName: string;
  document?: Document;
  phone: string;
  email: string;
  projectName: string;
  purpose?: string;
  amount: number;
  creditLine: string;
  propertyName: string;
  area: number;
  location: string | PropertyLocation;
  status: string;
  createdAt: string;
  updatedAt: string;
  PK?: string;
  SK?: string;
}
