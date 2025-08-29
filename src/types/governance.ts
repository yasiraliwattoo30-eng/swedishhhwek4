export interface GovernanceRole {
  id: string;
  name: string;
  permissions: string[];
  description: string;
}

export interface UserRole {
  user_id: string;
  foundation_id: string;
  role_id: string;
  assigned_by: string;
  assigned_at: string;
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
  step_order: number;
  assignee_name: string;
  assignee_id: string;
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

export interface MeetingMinutes {
  id: string;
  meeting_id: string;
  content: string;
  attendees_present: string[];
  decisions_made: Decision[];
  action_items: ActionItem[];
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  status: 'draft' | 'pending_approval' | 'approved';
  digital_signatures: DigitalSignature[];
  created_at: string;
  updated_at: string;
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  decision_type: 'resolution' | 'policy' | 'budget' | 'other';
  votes_for: number;
  votes_against: number;
  abstentions: number;
  outcome: 'passed' | 'rejected';
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
}

export interface DigitalSignature {
  id: string;
  signer_id: string;
  signature_method: 'bankid' | 'manual';
  signature_data: string;
  signed_at: string;
  ip_address: string;
}

export interface AuditTrail {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  user_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}