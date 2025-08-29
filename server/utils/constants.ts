export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

export const FOUNDATION_STATUS = {
  PENDING_VERIFICATION: 'pending_verification',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
} as const;

export const DOCUMENT_TYPES = {
  ARTICLES_OF_ASSOCIATION: 'articles_of_association',
  BYLAWS: 'bylaws',
  FINANCIAL_STATEMENT: 'financial_statement',
  BOARD_RESOLUTION: 'board_resolution',
  OTHER: 'other'
} as const;

export const DOCUMENT_STATUS = {
  UPLOADED: 'uploaded',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export const MEETING_TYPES = {
  BOARD_MEETING: 'board_meeting',
  GENERAL_ASSEMBLY: 'general_assembly',
  COMMITTEE_MEETING: 'committee_meeting',
  OTHER: 'other'
} as const;

export const MEETING_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const EXPENSE_CATEGORIES = {
  OFFICE_SUPPLIES: 'office_supplies',
  TRAVEL: 'travel',
  MEALS: 'meals',
  UTILITIES: 'utilities',
  PROFESSIONAL_SERVICES: 'professional_services',
  MARKETING: 'marketing',
  OTHER: 'other'
} as const;

export const EXPENSE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export const INVESTMENT_TYPES = {
  STOCK: 'stock',
  BOND: 'bond',
  MUTUAL_FUND: 'mutual_fund',
  REAL_ESTATE: 'real_estate',
  COMMODITY: 'commodity',
  CASH: 'cash',
  OTHER: 'other'
} as const;

export const PROJECT_STATUS = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
  CANCELLED: 'cancelled'
} as const;

export const GRANT_STATUS = {
  APPLIED: 'applied',
  UNDER_REVIEW: 'under_review',
  AWARDED: 'awarded',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const CURRENCIES = {
  SEK: 'SEK',
  EUR: 'EUR',
  USD: 'USD',
  NOK: 'NOK',
  DKK: 'DKK'
} as const;

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer'
} as const;

export const PERMISSIONS = {
  // Foundation management
  MANAGE_FOUNDATION: 'manage_foundation',
  VIEW_FOUNDATION: 'view_foundation',
  
  // User management
  MANAGE_USERS: 'manage_users',
  INVITE_USERS: 'invite_users',
  
  // Document management
  UPLOAD_DOCUMENTS: 'upload_documents',
  APPROVE_DOCUMENTS: 'approve_documents',
  VIEW_DOCUMENTS: 'view_documents',
  
  // Meeting management
  SCHEDULE_MEETINGS: 'schedule_meetings',
  CREATE_MINUTES: 'create_minutes',
  APPROVE_MINUTES: 'approve_minutes',
  
  // Financial management
  MANAGE_EXPENSES: 'manage_expenses',
  APPROVE_EXPENSES: 'approve_expenses',
  MANAGE_INVESTMENTS: 'manage_investments',
  VIEW_FINANCIAL_DATA: 'view_financial_data',
  
  // Governance
  MANAGE_COMPLIANCE: 'manage_compliance',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  MANAGE_WORKFLOWS: 'manage_workflows',
  
  // Reporting
  GENERATE_REPORTS: 'generate_reports',
  EXPORT_DATA: 'export_data'
} as const;

export const REGULATION_TYPES = {
  LANSSTYRELSEN: 'lansstyrelsen',
  SKATTEVERKET: 'skatteverket',
  BOLAGSVERKET: 'bolagsverket',
  OTHER: 'other'
} as const;

export const COMPLIANCE_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export const ACCOUNT_TYPES = {
  ASSET: 'asset',
  LIABILITY: 'liability',
  EQUITY: 'equity',
  REVENUE: 'revenue',
  EXPENSE: 'expense'
} as const;

export const JOURNAL_ENTRY_STATUS = {
  DRAFT: 'draft',
  POSTED: 'posted',
  REVERSED: 'reversed'
} as const;

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
} as const;

export const BANK_ACCOUNT_TYPES = {
  CHECKING: 'checking',
  SAVINGS: 'savings',
  BUSINESS: 'business'
} as const;

export const REPORT_TYPES = {
  BALANCE_SHEET: 'balance_sheet',
  INCOME_STATEMENT: 'income_statement',
  CASH_FLOW: 'cash_flow',
  TRIAL_BALANCE: 'trial_balance',
  TAX_REPORT: 'tax_report'
} as const;

export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
  ALLOWED_RECEIPT_TYPES: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
} as const;

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  FOUNDATION_NAME_MIN_LENGTH: 2,
  DESCRIPTION_MIN_LENGTH: 10,
  PERSONAL_NUMBER_REGEX: /^\d{8}-\d{4}$/,
  PHONE_NUMBER_REGEX: /^\+46\s?[1-9]\d{1,2}\s?\d{3}\s?\d{2}\s?\d{2}$/,
  ORGANIZATION_NUMBER_REGEX: /^\d{6}-\d{4}$/
} as const;

export const API_RATE_LIMITS = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  BANKID_WINDOW_MS: 5 * 60 * 1000, // 5 minutes
  BANKID_MAX_REQUESTS: 10
} as const;