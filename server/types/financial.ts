export interface Account {
  id: string;
  foundation_id: string;
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