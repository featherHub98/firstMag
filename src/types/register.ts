export interface Register {
  id: string;
  code: string;
  name: string;
  location: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRegister {
  code: string;
  name: string;
  location: string;
  active?: boolean;
}

export interface UpdateRegister {
  id: string;
  code?: string;
  name?: string;
  location?: string;
  active?: boolean;
}
