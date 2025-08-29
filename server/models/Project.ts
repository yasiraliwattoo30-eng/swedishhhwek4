import { supabase } from '../config/database';

export interface Project {
  id: string;
  foundation_id: string;
  name: string;
  description?: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  start_date?: string;
  end_date?: string;
  budget?: number;
  currency?: string;
  project_manager_id?: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Grant {
  id: string;
  project_id: string;
  grant_name: string;
  grantor_name: string;
  amount: number;
  currency: string;
  status: 'applied' | 'under_review' | 'awarded' | 'rejected' | 'completed' | 'cancelled';
  application_date: string;
  award_date?: string;
  completion_date?: string;
  requirements: any[];
  reporting_schedule: any[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class ProjectModel {
  static async findById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  static async findByFoundation(foundationId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('foundation_id', foundationId)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  }

  static async create(projectData: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        progress_percentage: 0,
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

  static async update(id: string, projectData: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({
        ...projectData,
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
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  static async updateProgress(id: string, progressPercentage: number): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({
        progress_percentage: progressPercentage,
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

  static async getGrants(projectId: string): Promise<Grant[]> {
    const { data, error } = await supabase
      .from('grants')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }
}

export class GrantModel {
  static async findById(id: string): Promise<Grant | null> {
    const { data, error } = await supabase
      .from('grants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  static async create(grantData: Partial<Grant>): Promise<Grant> {
    const { data, error } = await supabase
      .from('grants')
      .insert({
        ...grantData,
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

  static async update(id: string, grantData: Partial<Grant>): Promise<Grant> {
    const { data, error } = await supabase
      .from('grants')
      .update({
        ...grantData,
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
      .from('grants')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }
}