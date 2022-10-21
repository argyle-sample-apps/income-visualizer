export interface Payout {
  id: string;
  account: string;
  document_id: string;
  deduction_list: Deduction[];
  filing_status: FilingStatus[];
  tax_list: Tax[];
  status: string;
  type: string;
  payout_date: Date;
  payout_period: PayoutPeriod;
  currency: string;
  gross_pay: string | null;
  deductions: string | null;
  taxes: string | null;
  net_pay: string | null;
  bonuses: string | null;
  commission: string;
  overtime: string;
  reimbursements: string;
  hours: string;
  fees: null;
  net_pay_ytd: string;
  gross_pay_ytd: string;
  metadata: any;
  employer: string;
  employer_address: EmployerAddress;
  created_at: Date;
  updated_at: Date;
  gross_pay_list_totals: any;
}

export interface Deduction {
  amount: string;
  name: string;
  tax_classification: string | null;
}

export interface EmployerAddress {
  city: string;
  state: string;
  country: string;
  postal_code: string;
  line1: string;
  line2: null;
}

export interface FilingStatus {
  type: string;
  location: string | null;
  status: string;
}

export interface PayoutPeriod {
  start_date: Date;
  end_date: Date;
}

export interface Tax {
  amount: string;
  name: string;
  type: string;
}
