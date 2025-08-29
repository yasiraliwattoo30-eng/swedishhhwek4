import { supabase } from '../config/database';

export interface Meeting {
  id: string;
  foundation_id: string;
  organizer_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  meeting_type: 'board_meeting' | 'general_assembly' | 'committee_meeting' | 'other';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  meeting_url?: string;
  attendees: string[];
  created_at: string;
  updated_at: string;
}

export interface MeetingMinutes {
  id: string;
  meeting_id: string;
  content: string;
  attendees_present: string[];
  decisions_made: any[];
  action_items: any[];
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  status: 'draft' | 'pending_approval' | 'approved';
  created_at: string;
  updated_at: string;
}

export class MeetingModel {
  static async findById(id: string): Promise<Meeting | null> {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  static async findByFoundation(foundationId: string): Promise<Meeting[]> {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('foundation_id', foundationId)
      .order('start_time', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  }

  static async create(meetingData: Partial<Meeting>): Promise<Meeting> {
    const { data, error } = await supabase
      .from('meetings')
      .insert({
        ...meetingData,
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

  static async update(id: string, meetingData: Partial<Meeting>): Promise<Meeting> {
    const { data, error } = await supabase
      .from('meetings')
      .update({
        ...meetingData,
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
      .from('meetings')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  static async getMinutes(meetingId: string): Promise<MeetingMinutes[]> {
    const { data, error } = await supabase
      .from('meeting_minutes')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  static async createMinutes(minutesData: Partial<MeetingMinutes>): Promise<MeetingMinutes> {
    const { data, error } = await supabase
      .from('meeting_minutes')
      .insert({
        ...minutesData,
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

  static async updateMinutes(id: string, minutesData: Partial<MeetingMinutes>): Promise<MeetingMinutes> {
    const { data, error } = await supabase
      .from('meeting_minutes')
      .update({
        ...minutesData,
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