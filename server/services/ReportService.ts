import { supabase } from '../config/database';
import { FinancialReport } from '../types/financial';

export class ReportService {
  static async generateBalanceSheet(
    foundationId: string, 
    asOfDate: string
  ): Promise<Record<string, any>> {
    // Get all accounts and their balances
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('account_type, balance, currency')
      .eq('foundation_id', foundationId)
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to fetch accounts: ${error.message}`);
    }

    const balanceSheet = {
      assets: {
        current_assets: 0,
        fixed_assets: 0,
        total_assets: 0
      },
      liabilities: {
        current_liabilities: 0,
        long_term_liabilities: 0,
        total_liabilities: 0
      },
      equity: {
        foundation_capital: 0,
        retained_earnings: 0,
        total_equity: 0
      }
    };

    accounts?.forEach(account => {
      switch (account.account_type) {
        case 'asset':
          balanceSheet.assets.current_assets += account.balance;
          break;
        case 'liability':
          balanceSheet.liabilities.current_liabilities += account.balance;
          break;
        case 'equity':
          balanceSheet.equity.foundation_capital += account.balance;
          break;
      }
    });

    balanceSheet.assets.total_assets = balanceSheet.assets.current_assets + balanceSheet.assets.fixed_assets;
    balanceSheet.liabilities.total_liabilities = balanceSheet.liabilities.current_liabilities + balanceSheet.liabilities.long_term_liabilities;
    balanceSheet.equity.total_equity = balanceSheet.equity.foundation_capital + balanceSheet.equity.retained_earnings;

    return {
      as_of_date: asOfDate,
      foundation_id: foundationId,
      ...balanceSheet
    };
  }

  static async generateIncomeStatement(
    foundationId: string,
    startDate: string,
    endDate: string
  ): Promise<Record<string, any>> {
    // Get revenue and expense accounts
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('account_type, balance, account_name')
      .eq('foundation_id', foundationId)
      .in('account_type', ['revenue', 'expense'])
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to fetch accounts: ${error.message}`);
    }

    const incomeStatement = {
      revenue: {
        donations: 0,
        investment_income: 0,
        other_income: 0,
        total_revenue: 0
      },
      expenses: {
        program_expenses: 0,
        administrative_expenses: 0,
        fundraising_expenses: 0,
        total_expenses: 0
      },
      net_income: 0
    };

    accounts?.forEach(account => {
      if (account.account_type === 'revenue') {
        if (account.account_name.toLowerCase().includes('donation')) {
          incomeStatement.revenue.donations += account.balance;
        } else if (account.account_name.toLowerCase().includes('investment')) {
          incomeStatement.revenue.investment_income += account.balance;
        } else {
          incomeStatement.revenue.other_income += account.balance;
        }
      } else if (account.account_type === 'expense') {
        if (account.account_name.toLowerCase().includes('program')) {
          incomeStatement.expenses.program_expenses += account.balance;
        } else if (account.account_name.toLowerCase().includes('admin')) {
          incomeStatement.expenses.administrative_expenses += account.balance;
        } else {
          incomeStatement.expenses.fundraising_expenses += account.balance;
        }
      }
    });

    incomeStatement.revenue.total_revenue = 
      incomeStatement.revenue.donations + 
      incomeStatement.revenue.investment_income + 
      incomeStatement.revenue.other_income;

    incomeStatement.expenses.total_expenses = 
      incomeStatement.expenses.program_expenses + 
      incomeStatement.expenses.administrative_expenses + 
      incomeStatement.expenses.fundraising_expenses;

    incomeStatement.net_income = incomeStatement.revenue.total_revenue - incomeStatement.expenses.total_expenses;

    return {
      period_start: startDate,
      period_end: endDate,
      foundation_id: foundationId,
      ...incomeStatement
    };
  }

  static async generateCashFlowStatement(
    foundationId: string,
    startDate: string,
    endDate: string
  ): Promise<Record<string, any>> {
    // Get cash flow data from bank transactions
    const { data: transactions, error } = await supabase
      .from('bank_transactions')
      .select(`
        amount,
        transaction_type,
        category,
        transaction_date,
        bank_accounts!inner(foundation_id)
      `)
      .eq('bank_accounts.foundation_id', foundationId)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate);

    if (error) {
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }

    const cashFlow = {
      operating_activities: {
        cash_receipts: 0,
        cash_payments: 0,
        net_cash_from_operations: 0
      },
      investing_activities: {
        investment_purchases: 0,
        investment_sales: 0,
        net_cash_from_investing: 0
      },
      financing_activities: {
        donations_received: 0,
        loan_proceeds: 0,
        net_cash_from_financing: 0
      },
      net_change_in_cash: 0
    };

    transactions?.forEach(transaction => {
      const amount = Math.abs(transaction.amount);
      
      if (transaction.category?.toLowerCase().includes('donation')) {
        if (transaction.transaction_type === 'credit') {
          cashFlow.financing_activities.donations_received += amount;
        }
      } else if (transaction.category?.toLowerCase().includes('investment')) {
        if (transaction.transaction_type === 'debit') {
          cashFlow.investing_activities.investment_purchases += amount;
        } else {
          cashFlow.investing_activities.investment_sales += amount;
        }
      } else {
        if (transaction.transaction_type === 'credit') {
          cashFlow.operating_activities.cash_receipts += amount;
        } else {
          cashFlow.operating_activities.cash_payments += amount;
        }
      }
    });

    cashFlow.operating_activities.net_cash_from_operations = 
      cashFlow.operating_activities.cash_receipts - cashFlow.operating_activities.cash_payments;

    cashFlow.investing_activities.net_cash_from_investing = 
      cashFlow.investing_activities.investment_sales - cashFlow.investing_activities.investment_purchases;

    cashFlow.financing_activities.net_cash_from_financing = 
      cashFlow.financing_activities.donations_received + cashFlow.financing_activities.loan_proceeds;

    cashFlow.net_change_in_cash = 
      cashFlow.operating_activities.net_cash_from_operations +
      cashFlow.investing_activities.net_cash_from_investing +
      cashFlow.financing_activities.net_cash_from_financing;

    return {
      period_start: startDate,
      period_end: endDate,
      foundation_id: foundationId,
      ...cashFlow
    };
  }

  static async generateComplianceReport(foundationId: string): Promise<Record<string, any>> {
    // This would query compliance items and generate a comprehensive report
    const complianceData = {
      foundation_id: foundationId,
      generated_at: new Date().toISOString(),
      compliance_status: {
        total_items: 15,
        completed: 12,
        in_progress: 2,
        overdue: 1
      },
      regulatory_bodies: {
        lansstyrelsen: { total: 8, completed: 7, pending: 1 },
        skatteverket: { total: 4, completed: 3, pending: 1 },
        bolagsverket: { total: 3, completed: 2, pending: 1 }
      },
      upcoming_deadlines: [
        {
          title: 'Annual Activity Report',
          due_date: '2024-04-30',
          days_remaining: 45,
          priority: 'high'
        }
      ]
    };

    return complianceData;
  }

  static async exportReportToPDF(reportData: Record<string, any>, reportType: string): Promise<Buffer> {
    // This would use a PDF generation library like puppeteer or jsPDF
    // For now, return a mock PDF buffer
    const pdfContent = `
      Foundation Management System Report
      Report Type: ${reportType}
      Generated: ${new Date().toISOString()}
      
      ${JSON.stringify(reportData, null, 2)}
    `;

    return Buffer.from(pdfContent, 'utf-8');
  }

  static async exportReportToExcel(reportData: Record<string, any>, reportType: string): Promise<Buffer> {
    // This would use a library like exceljs to generate Excel files
    // For now, return a mock Excel buffer
    const excelContent = `Report Type,${reportType}\nGenerated,${new Date().toISOString()}\n\n${JSON.stringify(reportData)}`;
    return Buffer.from(excelContent, 'utf-8');
  }

  static async exportReportToCSV(reportData: Record<string, any>): Promise<Buffer> {
    // Convert report data to CSV format
    const csvRows = ['Field,Value'];
    
    const flattenObject = (obj: any, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          flattenObject(value, newKey);
        } else {
          csvRows.push(`"${newKey}","${value}"`);
        }
      });
    };

    flattenObject(reportData);
    
    return Buffer.from(csvRows.join('\n'), 'utf-8');
  }
}