import { Response } from 'express';
import { supabase } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export class FinancialController {
  // Account management
  static getAccounts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { foundation_id } = req.query;

    let query = supabase
      .from('accounts')
      .select('*')
      .order('account_number', { ascending: true });

    if (foundation_id) {
      query = query.eq('foundation_id', foundation_id);
    }

    const { data: accounts, error } = await query;

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({
      accounts: accounts || [],
      total: accounts?.length || 0
    });
  });

  static createAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      foundation_id,
      account_number,
      account_name,
      account_type,
      currency
    } = req.body;

    const { data: account, error } = await supabase
      .from('accounts')
      .insert({
        foundation_id,
        account_number,
        account_name,
        account_type,
        balance: 0,
        currency,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.status(201).json({
      message: 'Account created successfully',
      account
    });
  });

  // Journal entries
  static getJournalEntries = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { foundation_id } = req.query;

    let query = supabase
      .from('journal_entries')
      .select(`
        *,
        journal_entry_lines(*)
      `)
      .order('entry_date', { ascending: false });

    if (foundation_id) {
      query = query.eq('foundation_id', foundation_id);
    }

    const { data: entries, error } = await query;

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({
      journal_entries: entries || [],
      total: entries?.length || 0
    });
  });

  static createJournalEntry = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      foundation_id,
      entry_date,
      description,
      line_items
    } = req.body;

    // Calculate totals
    const totalDebit = line_items.reduce((sum: number, item: any) => sum + (item.debit_amount || 0), 0);
    const totalCredit = line_items.reduce((sum: number, item: any) => sum + (item.credit_amount || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw createError('Journal entry must be balanced (debits must equal credits)', 400);
    }

    // Generate entry number
    const entryNumber = `JE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const { data: entry, error } = await supabase
      .from('journal_entries')
      .insert({
        foundation_id,
        entry_number: entryNumber,
        entry_date,
        description,
        total_debit: totalDebit,
        total_credit: totalCredit,
        status: 'draft',
        created_by: req.user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    // Insert line items
    const lineItemsWithEntryId = line_items.map((item: any, index: number) => ({
      journal_entry_id: entry.id,
      account_id: item.account_id,
      description: item.description,
      debit_amount: item.debit_amount || 0,
      credit_amount: item.credit_amount || 0,
      line_order: index + 1
    }));

    const { error: lineItemsError } = await supabase
      .from('journal_entry_lines')
      .insert(lineItemsWithEntryId);

    if (lineItemsError) {
      // Clean up entry if line items fail
      await supabase.from('journal_entries').delete().eq('id', entry.id);
      throw createError(lineItemsError.message, 400);
    }

    res.status(201).json({
      message: 'Journal entry created successfully',
      entry
    });
  });

  // Invoicing
  static getInvoices = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { foundation_id, invoice_type, status } = req.query;

    let query = supabase
      .from('invoices')
      .select(`
        *,
        invoice_line_items(*),
        payments(*)
      `)
      .order('created_at', { ascending: false });

    if (foundation_id) {
      query = query.eq('foundation_id', foundation_id);
    }
    if (invoice_type) {
      query = query.eq('invoice_type', invoice_type);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: invoices, error } = await query;

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({
      invoices: invoices || [],
      total: invoices?.length || 0
    });
  });

  static createInvoice = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      foundation_id,
      invoice_type,
      customer_supplier_name,
      invoice_date,
      due_date,
      line_items,
      payment_terms,
      notes
    } = req.body;

    // Calculate totals
    const subtotal = line_items.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.unit_price), 0);
    const taxAmount = line_items.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.unit_price * item.tax_rate / 100), 0);
    const totalAmount = subtotal + taxAmount;

    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        foundation_id,
        invoice_number: invoiceNumber,
        invoice_type,
        customer_supplier_name,
        invoice_date,
        due_date,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        currency: 'SEK',
        status: 'draft',
        payment_terms: payment_terms || 'Net 30',
        notes,
        created_by: req.user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    // Insert line items
    const lineItemsWithInvoiceId = line_items.map((item: any, index: number) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_rate: item.tax_rate,
      line_total: item.quantity * item.unit_price,
      line_order: index + 1
    }));

    const { error: lineItemsError } = await supabase
      .from('invoice_line_items')
      .insert(lineItemsWithInvoiceId);

    if (lineItemsError) {
      // Clean up invoice if line items fail
      await supabase.from('invoices').delete().eq('id', invoice.id);
      throw createError(lineItemsError.message, 400);
    }

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice
    });
  });

  // Bank accounts
  static getBankAccounts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { foundation_id } = req.query;

    let query = supabase
      .from('bank_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (foundation_id) {
      query = query.eq('foundation_id', foundation_id);
    }

    const { data: accounts, error } = await query;

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({
      bank_accounts: accounts || [],
      total: accounts?.length || 0
    });
  });

  static createBankAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      foundation_id,
      account_name,
      bank_name,
      account_number,
      iban,
      currency,
      account_type
    } = req.body;

    const { data: account, error } = await supabase
      .from('bank_accounts')
      .insert({
        foundation_id,
        account_name,
        bank_name,
        account_number,
        iban,
        currency,
        account_type,
        current_balance: 0,
        is_primary: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.status(201).json({
      message: 'Bank account created successfully',
      account
    });
  });

  // Bank transactions
  static getBankTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { bank_account_id, is_reconciled } = req.query;

    let query = supabase
      .from('bank_transactions')
      .select(`
        *,
        bank_accounts(account_name, bank_name)
      `)
      .order('transaction_date', { ascending: false });

    if (bank_account_id) {
      query = query.eq('bank_account_id', bank_account_id);
    }
    if (is_reconciled !== undefined) {
      query = query.eq('is_reconciled', is_reconciled === 'true');
    }

    const { data: transactions, error } = await query;

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({
      transactions: transactions || [],
      total: transactions?.length || 0
    });
  });

  static syncBankTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { bank_account_id } = req.body;

    // This would integrate with actual bank APIs
    // For now, simulate the sync process
    const mockTransactions = [
      {
        bank_account_id,
        transaction_date: new Date().toISOString().split('T')[0],
        description: 'Donation received',
        amount: 50000,
        transaction_type: 'credit',
        balance_after: 1300000,
        is_reconciled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const { data: transactions, error } = await supabase
      .from('bank_transactions')
      .insert(mockTransactions)
      .select();

    if (error) {
      throw createError(error.message, 400);
    }

    // Update last sync time
    await supabase
      .from('bank_accounts')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', bank_account_id);

    res.json({
      message: 'Bank transactions synced successfully',
      transactions: transactions || [],
      synced_count: transactions?.length || 0
    });
  });

  static reconcileTransaction = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const { data: transaction, error } = await supabase
      .from('bank_transactions')
      .update({
        is_reconciled: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({
      message: 'Transaction reconciled successfully',
      transaction
    });
  });

  // Financial reports
  static getFinancialReports = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { foundation_id, report_type } = req.query;

    let query = supabase
      .from('financial_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (foundation_id) {
      query = query.eq('foundation_id', foundation_id);
    }
    if (report_type) {
      query = query.eq('report_type', report_type);
    }

    const { data: reports, error } = await query;

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({
      reports: reports || [],
      total: reports?.length || 0
    });
  });

  static generateFinancialReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      foundation_id,
      report_type,
      period_start,
      period_end
    } = req.body;

    // Generate report data based on type
    let reportData = {};
    
    switch (report_type) {
      case 'balance_sheet':
        reportData = await generateBalanceSheet(foundation_id, period_end);
        break;
      case 'income_statement':
        reportData = await generateIncomeStatement(foundation_id, period_start, period_end);
        break;
      case 'cash_flow':
        reportData = await generateCashFlowStatement(foundation_id, period_start, period_end);
        break;
      default:
        throw createError('Invalid report type', 400);
    }

    const { data: report, error } = await supabase
      .from('financial_reports')
      .insert({
        foundation_id,
        report_type,
        report_name: `${report_type.replace('_', ' ')} - ${period_start} to ${period_end}`,
        period_start,
        period_end,
        generated_by: req.user?.id,
        generated_at: new Date().toISOString(),
        report_data: reportData,
        status: 'completed'
      })
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.status(201).json({
      message: 'Financial report generated successfully',
      report
    });
  });
}

// Helper functions for report generation
async function generateBalanceSheet(foundationId: string, asOfDate: string) {
  // This would query accounts and calculate balances
  return {
    assets: {
      current_assets: 500000,
      fixed_assets: 1000000,
      total_assets: 1500000
    },
    liabilities: {
      current_liabilities: 50000,
      long_term_liabilities: 100000,
      total_liabilities: 150000
    },
    equity: {
      foundation_capital: 1000000,
      retained_earnings: 350000,
      total_equity: 1350000
    }
  };
}

async function generateIncomeStatement(foundationId: string, startDate: string, endDate: string) {
  return {
    revenue: {
      donations: 200000,
      investment_income: 50000,
      total_revenue: 250000
    },
    expenses: {
      program_expenses: 150000,
      administrative_expenses: 50000,
      total_expenses: 200000
    },
    net_income: 50000
  };
}

async function generateCashFlowStatement(foundationId: string, startDate: string, endDate: string) {
  return {
    operating_activities: {
      net_income: 50000,
      adjustments: 10000,
      net_cash_from_operations: 60000
    },
    investing_activities: {
      investment_purchases: -100000,
      investment_sales: 50000,
      net_cash_from_investing: -50000
    },
    financing_activities: {
      donations_received: 200000,
      net_cash_from_financing: 200000
    },
    net_change_in_cash: 210000
  };
}