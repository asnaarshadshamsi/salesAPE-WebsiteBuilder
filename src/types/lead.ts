export type LeadStatus = 'NEW' | 'CONTACTED' | 'BOOKED' | 'CONVERTED' | 'LOST';

export interface LeadFormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select';
  required: boolean;
  options?: string[];
}

export interface Lead {
  id: string;
  siteId: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: LeadStatus;
  variant: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeadInput {
  siteId: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  variant?: string;
}
