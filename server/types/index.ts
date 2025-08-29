export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

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

export interface Document {
  id: string;
  foundation_id: string;
  uploaded_by: string;
  document_type: 'articles_of_association' | 'bylaws' | 'financial_statement' | 'board_resolution' | 'other';
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  status: 'uploaded' | 'pending_approval' | 'approved' | 'rejected';
  approval_notes?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}