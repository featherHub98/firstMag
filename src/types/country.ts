export interface Country {
  id: string;
  code: string;
  name: string;
  iso2: string;
  phone_code: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCountry {
  code: string;
  name: string;
  iso2: string;
  phone_code: string;
  active?: boolean;
}

export interface UpdateCountry {
  id: string;
  code?: string;
  name?: string;
  iso2?: string;
  phone_code?: string;
  active?: boolean;
}
