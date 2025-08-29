import { supabase } from '../config/database';

export interface Investment {
  id: string;
  foundation_id: string;
  type: 'stock' | 'bond' | 'mutual_fund' | 'real_estate' | 'commodity' | 'cash' | 'other';
  name: string;
  amount: number;
  currency: string;
  acquisition_date: string;
  current_value?: number;
  performance?: number;
  notes?: string;
  managed_by: string;
  created_at: string;
  updated_at: string;
}

export class InvestmentModel {
  static async findById(id: string): Promise<Investment | null> {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  static async findByFoundation(foundationId: string): Promise<Investment[]> {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('foundation_id', foundationId)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  }

  static async create(investmentData: Partial<Investment>): Promise<Investment> {
    const { data, error } = await supabase
      .from('investments')
      .insert({
        ...investmentData,
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

  static async update(id: string, investmentData: Partial<Investment>): Promise<Investment> {
    const { data, error } = await supabase
      .from('investments')
      .update({
        ...investmentData,
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
      .from('investments')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  static async updateValue(id: string, currentValue: number, performance?: number): Promise<Investment> {
    const { data, error } = await supabase
      .from('investments')
      .update({
        current_value: currentValue,
        performance,
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

  static async getPortfolioSummary(foundationId: string): Promise<any> {
    const { data: investments, error } = await supabase
      .from('investments')
      .select('amount, current_value, type, performance')
      .eq('foundation_id', foundationId);

    if (error) {
      throw new Error(error.message);
    }

    const summary = {
      total_invested: investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0,
      current_value: investments?.reduce((sum, inv) => sum + (inv.current_value || inv.amount), 0) || 0,
      total_gain_loss: 0,
      by_type: {} as Record<string, number>
    };

    summary.total_gain_loss = summary.current_value - summary.total_invested;

    investments?.forEach(inv => {
      summary.by_type[inv.type] = (summary.by_type[inv.type] || 0) + inv.amount;
    });

    return summary;
  }
}