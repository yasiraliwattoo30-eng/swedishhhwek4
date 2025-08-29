export interface FoundationRegistration {
  id: string;
  foundation_name: string;
  purpose: string;
  registered_office_address: string;
  postal_code: string;
  city: string;
  country: string;
  initial_capital: number;
  currency: string;
  board_members: BoardMember[];
  contact_person: ContactPerson;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'verified';
  submission_reference?: string;
  authority_response?: AuthorityResponse;
  documents_generated: GeneratedDocument[];
  compliance_checks: ComplianceCheck[];
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  approved_at?: string;
}

export interface BoardMember {
  id: string;
  first_name: string;
  last_name: string;
  personal_number: string;
  email: string;
  phone?: string;
  address: string;
  role: 'chairman' | 'vice_chairman' | 'member' | 'secretary' | 'treasurer';
  is_signatory: boolean;
  bankid_verified: boolean;
  verification_date?: string;
}

export interface ContactPerson {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  is_authorized_representative: boolean;
}

export interface GeneratedDocument {
  id: string;
  document_type: 'statutes' | 'application_form' | 'board_resolution' | 'registration_certificate';
  file_name: string;
  file_path: string;
  status: 'generated' | 'signed' | 'submitted';
  digital_signatures: DigitalSignature[];
  generated_at: string;
}

export interface DigitalSignature {
  id: string;
  signer_id: string;
  signer_name: string;
  personal_number: string;
  signature_method: 'bankid';
  signature_data: string;
  signed_at: string;
  ip_address: string;
  certificate_info: {
    not_before: string;
    not_after: string;
    issuer: string;
  };
}

export interface ComplianceCheck {
  id: string;
  check_type: 'minimum_capital' | 'board_composition' | 'purpose_validity' | 'name_availability';
  status: 'pending' | 'passed' | 'failed';
  details: string;
  checked_at: string;
}

export interface AuthorityResponse {
  authority: 'lansstyrelsen' | 'bolagsverket' | 'skatteverket';
  response_type: 'acknowledgment' | 'approval' | 'rejection' | 'request_for_information';
  reference_number: string;
  message: string;
  received_at: string;
  documents_attached: string[];
}

export interface RegistrationStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  required_documents: string[];
  completed_at?: string;
  notes?: string;
}

export interface FoundationUser {
  id: string;
  foundation_id: string;
  email: string;
  full_name: string;
  role: 'founder' | 'board_member' | 'administrator';
  access_level: 'limited' | 'full';
  is_verified: boolean;
  created_during_registration: boolean;
  created_at: string;
}