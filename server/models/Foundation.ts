import { supabase } from '../config/database';

export interface Foundation {
  id: string;
  name: string;
  registration_number?: string;
  status: 'pending_verification' | 'active' | 'inactive' | 'suspended';
  owner_user_id: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface FoundationMember {
  foundation_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: Record<string, any>;
  invited_by?: string;
  joined_at: string;
  created_at: string;
}

export class FoundationModel {
  static async findById(id: string): Promise<Foundation | null> {
    const { data, error } = await supabase
      .from('foundations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  static async findByUserId(userId: string): Promise<Foundation[]> {
    const { data, error } = await supabase
      .from('foundations')
      .select(`
        *,
        foundation_members!inner(role, permissions)
      `)
      .eq('foundation_members.user_id', userId);

    if (error) {
      return [];
    }

    return data || [];
  }

  static async create(foundationData: Partial<Foundation>): Promise<Foundation> {
    const { data, error } = await supabase
      .from('foundations')
      .insert({
        ...foundationData,
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

  static async update(id: string, foundationData: Partial<Foundation>): Promise<Foundation> {
    const { data, error } = await supabase
      .from('foundations')
      .update({
        ...foundationData,
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
      .from('foundations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  static async getMembers(foundationId: string): Promise<FoundationMember[]> {
    const { data, error } = await supabase
      .from('foundation_members')
      .select(`
        *,
        profiles(full_name, email, avatar_url)
      `)
      .eq('foundation_id', foundationId);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  static async addMember(memberData: Partial<FoundationMember>): Promise<FoundationMember> {
    const { data, error } = await supabase
      .from('foundation_members')
      .insert({
        ...memberData,
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async updateMember(
    foundationId: string, 
    userId: string, 
    memberData: Partial<FoundationMember>
  ): Promise<FoundationMember> {
    const { data, error } = await supabase
      .from('foundation_members')
      .update(memberData)
      .eq('foundation_id', foundationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async removeMember(foundationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('foundation_members')
      .delete()
      .eq('foundation_id', foundationId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }
  }

  static async checkUserAccess(foundationId: string, userId: string): Promise<FoundationMember | null> {
    const { data, error } = await supabase
      .from('foundation_members')
      .select('*')
      .eq('foundation_id', foundationId)
      .eq('user_id', userId)
      .single();

    if (error) {
      return null;
    }

    return data;
  }
}