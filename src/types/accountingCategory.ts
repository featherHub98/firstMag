export interface AccountingCategory {
  id: string;
  code: string;
  name: string;
  account_number: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountingCategory {
  code: string;
  name: string;
  account_number: string;
  active?: boolean;
}

export interface UpdateAccountingCategory {
  id: string;
  code?: string;
  name?: string;
  account_number?: string;
  active?: boolean;
}
