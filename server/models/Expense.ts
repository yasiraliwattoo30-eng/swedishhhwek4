import { supabase } from '../config/database';

export interface Expense {
  id: string;
  foundation_id: string;
  user_id: string;
  amount: number;
  currency: string;
  category: 'office_supplies' | 'travel' | 'meals' | 'utilities' | 'professional_services' | 'marketing' | 'other';
  description: string;
  receipt_url?: string;
  expense_date: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export class ExpenseModel {
  static async findById(id: string): Promise<Expense | null> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  static async findByFoundation(foundationId: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('foundation_id', foundationId)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  }

  static async findByUser(userId: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  }

  static async create(expenseData: Partial<Expense>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        ...expenseData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async update(id: string, expenseData: Partial<Expense>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        ...expenseData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  static async approve(id: string, approvedBy: string): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async reject(id: string, approvedBy: string, rejectionReason: string): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        status: 'rejected',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}