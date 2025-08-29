export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  created_at: string;
}

export interface DocumentWorkflow {
  id: string;
  document_id: string;
  workflow_type: 'approval' | 'review' | 'signature';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  steps: WorkflowStep[];
  created_at: string;
  completed_at?: string;
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  assignee_id: string;
  assignee_name: string;
  action_type: 'review' | 'approve' | 'sign';
  status: 'pending' | 'completed' | 'rejected';
  completed_at?: string;
  comments?: string;
  digital_signature?: string;
}

export interface ComplianceItem {
  id: string;
  foundation_id: string;
  regulation_type: 'lansstyrelsen' | 'skatteverket' | 'bolagsverket' | 'other';
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to: string;
  documents_required: string[];
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  foundation_id?: string;
  action: string;
  target_table?: string;
  target_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export interface BankIDSession {
  id: string;
  user_id: string;
  session_id: string;
  personal_number: string;
  authentication_type: 'sign' | 'auth';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  order_ref: string;
  auto_start_token?: string;
  completion_data?: BankIDCompletionData;
  created_at: string;
  completed_at?: string;
}

export interface BankIDCompletionData {
  user: {
    personal_number: string;
    name: string;
    given_name: string;
    surname: string;
  };
  device: {
    ip_address: string;
    user_agent: string;
  };
  cert: {
    not_before: string;
    not_after: string;
  };
  signature?: string;
  ocsp_response?: string;
}