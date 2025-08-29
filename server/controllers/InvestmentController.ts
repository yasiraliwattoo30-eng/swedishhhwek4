import { Response } from 'express';
import { supabase } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export class InvestmentController {
  static getInvestments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { foundation_id, type } = req.query;

    let query = supabase
      .from('investments')
      .select(`
        *,
        foundations(name),
        profiles!investments_managed_by_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (foundation_id) {
      query = query.eq('foundation_id', foundation_id);
    }
    if (type) {
      query = query.eq('type', type);
    }

    const { data: investments, error } = await query;

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({
      investments: investments || [],
      total: investments?.length || 0
    });
  });

  static getInvestmentById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const { data: investment, error } = await supabase
      .from('investments')
      .select(`
        *,
        foundations(name),
        profiles!investments_managed_by_fkey(full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw createError('Investment not found', 404);
    }

    res.json({ investment });
  });

  static createInvestment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      foundation_id,
      type,
      name,
      amount,
      currency,
      acquisition_date,
      current_value,
      performance,
      notes
    } = req.body;

    const { data: investment, error } = await supabase
      .from('investments')
      .insert({
        foundation_id,
        type,
        name,
        amount: parseFloat(amount),
        currency,
        acquisition_date,
        current_value: current_value ? parseFloat(current_value) : null,
        performance: performance ? parseFloat(performance) : null,
        notes,
        managed_by: req.user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.status(201).json({
      message: 'Investment created successfully',
      investment
    });
  });

  static updateInvestment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const {
      name,
      amount,
      current_value,
      performance,
      notes
    } = req.body;

    const { data: investment, error } = await supabase
      .from('investments')
      .update({
        name,
        amount: amount ? parseFloat(amount) : undefined,
        current_value: current_value ? parseFloat(current_value) : undefined,
        performance: performance ? parseFloat(performance) : undefined,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({
      message: 'Investment updated successfully',
      investment
    });
  });

  static deleteInvestment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id);

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({ message: 'Investment deleted successfully' });
  });

  static getInvestmentPerformance = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    // This would typically fetch historical performance data
    // For now, return mock data structure
    const performanceData = [
      { date: '2024-01-01', value: 100000, performance: 0 },
      { date: '2024-02-01', value: 102000, performance: 2.0 },
      { date: '2024-03-01', value: 98000, performance: -2.0 },
      { date: '2024-04-01', value: 105000, performance: 5.0 }
    ];

    res.json({
      investment_id: id,
      performance_data: performanceData
    });
  });

  static updateInvestmentValue = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { current_value, performance } = req.body;

    const { data: investment, error } = await supabase
      .from('investments')
      .update({
        current_value: parseFloat(current_value),
        performance: performance ? parseFloat(performance) : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({
      message: 'Investment value updated successfully',
      investment
    });
  });
}