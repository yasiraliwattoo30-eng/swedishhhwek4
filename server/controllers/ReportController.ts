import { Response } from 'express';
import { supabase } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export class ReportController {
  static getDashboardAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;

    // Get foundation count
    const { data: foundations, error: foundationsError } = await supabase
      .from('foundations')
      .select('id, status')
      .eq('owner_user_id', userId);

    if (foundationsError) {
      throw createError(foundationsError.message, 500);
    }

    // Get recent activities
    const { data: activities, error: activitiesError } = await supabase
      .from('audit_logs')
      .select(`
        *,
        profiles(full_name)
      `)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (activitiesError) {
      throw createError(activitiesError.message, 500);
    }

    const analytics = {
      foundations: {
        total: foundations?.length || 0,
        active: foundations?.filter(f => f.status === 'active').length || 0,
        pending: foundations?.filter(f => f.status === 'pending_verification').length || 0
      },
      recent_activities: activities || []
    };

    res.json({ analytics });
  });

  static getFinancialOverview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { foundation_id, period_start, period_end } = req.query;

    // Get expenses summary
    let expenseQuery = supabase
      .from('expenses')
      .select('amount, currency, category, status');

    if (foundation_id) {
      expenseQuery = expenseQuery.eq('foundation_id', foundation_id);
    }
    if (period_start && period_end) {
      expenseQuery = expenseQuery
        .gte('expense_date', period_start)
        .lte('expense_date', period_end);
    }

    const { data: expenses, error: expensesError } = await expenseQuery;

    if (expensesError) {
      throw createError(expensesError.message, 500);
    }

    // Get investments summary
    let investmentQuery = supabase
      .from('investments')
      .select('amount, current_value, currency, type');

    if (foundation_id) {
      investmentQuery = investmentQuery.eq('foundation_id', foundation_id);
    }

    const { data: investments, error: investmentsError } = await investmentQuery;

    if (investmentsError) {
      throw createError(investmentsError.message, 500);
    }

    const overview = {
      expenses: {
        total: expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0,
        by_category: expenses?.reduce((acc, exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
          return acc;
        }, {} as Record<string, number>) || {},
        by_status: expenses?.reduce((acc, exp) => {
          acc[exp.status] = (acc[exp.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {}
      },
      investments: {
        total_invested: investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0,
        current_value: investments?.reduce((sum, inv) => sum + (inv.current_value || inv.amount), 0) || 0,
        by_type: investments?.reduce((acc, inv) => {
          acc[inv.type] = (acc[inv.type] || 0) + inv.amount;
          return acc;
        }, {} as Record<string, number>) || {}
      }
    };

    res.json({ overview });
  });

  static getExpenseAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { foundation_id } = req.query;

    let query = supabase
      .from('expenses')
      .select('amount, category, expense_date, status');

    if (foundation_id) {
      query = query.eq('foundation_id', foundation_id);
    }

    const { data: expenses, error } = await query;

    if (error) {
      throw createError(error.message, 500);
    }

    const analytics = {
      total_amount: expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0,
      by_category: expenses?.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {} as Record<string, number>) || {},
      by_status: expenses?.reduce((acc, exp) => {
        acc[exp.status] = (acc[exp.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      monthly_trends: generateMonthlyTrends(expenses || [])
    };

    res.json({ analytics });
  });

  static getInvestmentAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { foundation_id } = req.query;

    let query = supabase
      .from('investments')
      .select('amount, current_value, type, performance, acquisition_date');

    if (foundation_id) {
      query = query.eq('foundation_id', foundation_id);
    }

    const { data: investments, error } = await query;

    if (error) {
      throw createError(error.message, 500);
    }

    const analytics = {
      total_invested: investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0,
      current_value: investments?.reduce((sum, inv) => sum + (inv.current_value || inv.amount), 0) || 0,
      total_gain_loss: investments?.reduce((sum, inv) => 
        sum + ((inv.current_value || inv.amount) - inv.amount), 0) || 0,
      by_type: investments?.reduce((acc, inv) => {
        acc[inv.type] = (acc[inv.type] || 0) + inv.amount;
        return acc;
      }, {} as Record<string, number>) || {},
      performance_summary: {
        best_performer: investments && investments.length > 0
          ? investments.reduce((best, inv) =>
              (inv.performance || 0) > ((best?.performance ?? 0)) ? inv : best,
              investments[0])
          : null,
        worst_performer: investments && investments.length > 0
          ? investments.reduce((worst, inv) =>
              (inv.performance || 0) < ((worst?.performance ?? 0)) ? inv : worst,
              investments[0])
          : null
      }
    };

    res.json({ analytics });
  });

  static getProjectAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { foundation_id } = req.query;

    let query = supabase
      .from('projects')
      .select('status, budget, progress_percentage, start_date, end_date');

    if (foundation_id) {
      query = query.eq('foundation_id', foundation_id);
    }

    const { data: projects, error } = await query;

    if (error) {
      throw createError(error.message, 500);
    }

    const analytics = {
      total_projects: projects?.length || 0,
      by_status: projects?.reduce((acc, proj) => {
        acc[proj.status] = (acc[proj.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      total_budget: projects?.reduce((sum, proj) => sum + (proj.budget || 0), 0) || 0,
      average_progress: projects?.reduce((sum, proj) => sum + proj.progress_percentage, 0) / (projects?.length || 1) || 0
    };

    res.json({ analytics });
  });

  static getComplianceAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {

    // This would query compliance items from database
    // For now, return mock analytics
    const analytics = {
      total_items: 15,
      by_status: {
        completed: 12,
        in_progress: 2,
        overdue: 1
      },
      by_regulation: {
        lansstyrelsen: 8,
        skatteverket: 4,
        bolagsverket: 3
      },
      upcoming_deadlines: 3
    };

    res.json({ analytics });
  });

  static exportReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { report_type, format } = req.query;

    // This would generate and export the requested report
    // For now, return a mock response
    const exportData = {
      export_id: Date.now().toString(),
      report_type,
      format: format || 'pdf',
      status: 'generating',
      estimated_completion: new Date(Date.now() + 30000).toISOString() // 30 seconds
    };

    res.json({
      message: 'Report export initiated',
      export: exportData
    });
  });
}

// Helper function to generate monthly trends
type Expense = {
  expense_date: string | Date;
  amount: number;
  category?: string;
  status?: string;
};

function generateMonthlyTrends(expenses: Expense[]) {
  const monthlyData: Record<string, number> = {};
  
  expenses.forEach(expense => {
    const month = new Date(expense.expense_date).toISOString().slice(0, 7); // YYYY-MM
    monthlyData[month] = (monthlyData[month] || 0) + expense.amount;
  });

  return Object.entries(monthlyData).map(([month, amount]) => ({
    month,
    amount
  }));
}