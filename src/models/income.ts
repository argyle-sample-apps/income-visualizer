export interface Income {
  monthly: Monthly[];
  total: Total;
  currency: string;
}

export interface Monthly {
  year: number;
  month: number;
  total: Total;
  data: TotalWithMetadata[];
}

export interface Total {
  account_id?: string;
  link_item?: string;
  gross_pay: null | string;
  net_pay: null | string;
  taxes: null | string;
  bonuses: null | string;
  commission: null | string;
  overtime: null | string;
  reimbursements: null | string;
  deductions: null | string;
}

export interface TotalWithMetadata extends Total {
  account_id: string;
  link_item: string;
}
