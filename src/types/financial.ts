export interface Account {
  id: string;
  account_number: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_account_id?: string;
  balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  foundation_id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  reference_number?: string;
  total_debit: number;
  total_credit: number;
  status: 'draft' | 'posted' | 'reversed';
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  line_items: JournalEntryLine[];
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  account_name: string;
  description?: string;
  debit_amount: number;
  credit_amount: number;
  line_order: number;
}

export interface Invoice {
  id: string;
  foundation_id: string;
  invoice_number: string;
  invoice_type: 'sales' | 'purchase';
  customer_supplier_id: string;
  customer_supplier_name: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_terms: string;
  notes?: string;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  line_items: InvoiceLineItem[];
  payments: Payment[];
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  line_total: number;
  account_id: string;
  line_order: number;
}

export interface Payment {
  id: string;
  foundation_id: string;
  invoice_id?: string;
  payment_number: string;
  payment_date: string;
  amount: number;
  currency: string;
  payment_method: 'bank_transfer' | 'card' | 'cash' | 'check';
  bank_account_id?: string;
  reference_number?: string;
  description?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierInvoice {
  id: string;
  foundation_id: string;
  supplier_id: string;
  supplier_name: string;
  invoice_number: string;
  supplier_invoice_number: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: 'received' | 'under_review' | 'approved' | 'rejected' | 'paid';
  approval_workflow_id?: string;
  payment_id?: string;
  document_path?: string;
  notes?: string;
  received_by: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  line_items: SupplierInvoiceLineItem[];
}

export interface SupplierInvoiceLineItem {
  id: string;
  supplier_invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  line_total: number;
  account_id: string;
  line_order: number;
}

export interface Employee {
  id: string;
  foundation_id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  position: string;
  department?: string;
  hire_date: string;
  employment_type: 'full_time' | 'part_time' | 'contractor' | 'intern';
  salary_type: 'monthly' | 'hourly';
  base_salary: number;
  currency: string;
  tax_id: string;
  bank_account?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PayrollRun {
  id: string;
  foundation_id: string;
  payroll_period_start: string;
  payroll_period_end: string;
  pay_date: string;
  status: 'draft' | 'calculated' | 'approved' | 'paid' | 'cancelled';
  total_gross_pay: number;
  total_deductions: number;
  total_net_pay: number;
  currency: string;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  payroll_entries: PayrollEntry[];
}

export interface PayrollEntry {
  id: string;
  payroll_run_id: string;
  employee_id: string;
  employee_name: string;
  gross_pay: number;
  tax_deduction: number;
  social_security_deduction: number;
  other_deductions: number;
  total_deductions: number;
  net_pay: number;
  hours_worked?: number;
  overtime_hours?: number;
  bonus_amount?: number;
}

export interface BankAccount {
  id: string;
  foundation_id: string;
  account_name: string;
  bank_name: string;
  account_number: string;
  iban?: string;
  swift_code?: string;
  currency: string;
  account_type: 'checking' | 'savings' | 'business';
  current_balance: number;
  is_primary: boolean;
  is_active: boolean;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BankTransaction {
  id: string;
  bank_account_id: string;
  transaction_date: string;
  description: string;
  reference_number?: string;
  amount: number;
  transaction_type: 'debit' | 'credit';
  balance_after: number;
  category?: string;
  is_reconciled: boolean;
  journal_entry_id?: string;
  created_at: string;
  updated_at: string;
}

export interface BankIDAuthentication {
  id: string;
  user_id: string;
  session_id: string;
  personal_number: string;
  authentication_type: 'sign' | 'auth';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  order_ref: string;
  auto_start_token?: string;
  completion_data?: {
    user: {
      personal_number: string;
      name: string;
      given_name: string;
      surname: string;
    };
    device: {
      ip_address: string;
      user_agent: string;
    };
    cert: {
      not_before: string;
      not_after: string;
    };
    signature?: string;
    ocsp_response?: string;
  };
  created_at: string;
  completed_at?: string;
}

export interface DocumentAuditTrail {
  id: string;
  document_id: string;
  document_type: string;
  action: 'created' | 'viewed' | 'modified' | 'approved' | 'rejected' | 'signed' | 'deleted';
  user_id: string;
  user_name: string;
  ip_address: string;
  user_agent: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  bankid_session_id?: string;
  timestamp: string;
}

export interface TaxConfiguration {
  id: string;
  foundation_id: string;
  tax_type: 'vat' | 'income_tax' | 'social_security' | 'payroll_tax';
  tax_name: string;
  tax_rate: number;
  is_active: boolean;
  effective_from: string;
  effective_to?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialReport {
  id: string;
  foundation_id: string;
  report_type: 'balance_sheet' | 'income_statement' | 'cash_flow' | 'trial_balance' | 'tax_report';
  report_name: string;
  period_start: string;
  period_end: string;
  generated_by: string;
  generated_at: string;
  report_data: Record<string, any>;
  file_path?: string;
  status: 'generating' | 'completed' | 'failed';
}