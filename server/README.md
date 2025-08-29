# Foundation Management System - Backend API

A comprehensive Node.js backend API for the Swedish Foundation Management System, built with Express.js and Supabase.

## Features

- **Authentication & Authorization**: JWT-based auth with Supabase integration
- **Foundation Management**: Complete CRUD operations for foundations
- **Document Management**: File upload, versioning, and approval workflows
- **Meeting Management**: Scheduling, minutes, and governance tracking
- **Financial Management**: Expenses, investments, bookkeeping, and reporting
- **Governance**: Role-based access control, compliance tracking, audit logs
- **File Storage**: Secure file upload and management with Supabase Storage
- **Audit Trails**: Comprehensive logging of all system activities
- **Notifications**: Email and push notification system
- **Security**: Rate limiting, input validation, and security headers

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer
- **Logging**: Morgan

## Project Structure

```
server/
├── controllers/          # Request handlers
├── routes/              # API route definitions
├── models/              # Data models and database interactions
├── middleware/          # Custom middleware functions
├── services/            # Business logic and external integrations
├── utils/               # Helper functions and utilities
├── config/              # Configuration files
├── types/               # TypeScript type definitions
└── index.ts             # Application entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Foundations
- `GET /api/foundations` - Get user's foundations
- `GET /api/foundations/:id` - Get foundation by ID
- `POST /api/foundations` - Create new foundation
- `PUT /api/foundations/:id` - Update foundation
- `DELETE /api/foundations/:id` - Delete foundation
- `GET /api/foundations/:id/members` - Get foundation members
- `POST /api/foundations/:id/members` - Add foundation member

### Documents
- `GET /api/documents` - Get documents with filters
- `GET /api/documents/:id` - Get document by ID
- `POST /api/documents` - Upload new document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/:id/download` - Download document
- `GET /api/documents/:id/versions` - Get document versions

### Meetings
- `GET /api/meetings` - Get meetings with filters
- `GET /api/meetings/:id` - Get meeting by ID
- `POST /api/meetings` - Create new meeting
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting
- `GET /api/meetings/:id/minutes` - Get meeting minutes
- `POST /api/meetings/:id/minutes` - Create meeting minutes

### Expenses
- `GET /api/expenses` - Get expenses with filters
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `POST /api/expenses/:id/approve` - Approve expense
- `POST /api/expenses/:id/reject` - Reject expense

### Investments
- `GET /api/investments` - Get investments with filters
- `GET /api/investments/:id` - Get investment by ID
- `POST /api/investments` - Create new investment
- `PUT /api/investments/:id` - Update investment
- `DELETE /api/investments/:id` - Delete investment
- `POST /api/investments/:id/update-value` - Update investment value

### Projects & Grants
- `GET /api/projects` - Get projects with filters
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/grants` - Get grants with filters
- `POST /api/grants` - Create grant application

### Financial
- `GET /api/financial/accounts` - Get chart of accounts
- `POST /api/financial/accounts` - Create new account
- `GET /api/financial/journal-entries` - Get journal entries
- `POST /api/financial/journal-entries` - Create journal entry
- `GET /api/financial/invoices` - Get invoices
- `POST /api/financial/invoices` - Create invoice
- `GET /api/financial/bank-accounts` - Get bank accounts
- `POST /api/financial/bank-accounts` - Add bank account

### Governance
- `GET /api/governance/roles` - Get governance roles
- `POST /api/governance/roles` - Create new role
- `GET /api/governance/workflows` - Get document workflows
- `POST /api/governance/workflows` - Create workflow
- `GET /api/governance/compliance` - Get compliance items
- `POST /api/governance/compliance` - Create compliance item
- `GET /api/governance/audit-logs` - Get audit logs

### Reports
- `GET /api/reports/dashboard` - Get dashboard analytics
- `GET /api/reports/financial-overview` - Get financial overview
- `GET /api/reports/expense-analytics` - Get expense analytics
- `GET /api/reports/investment-analytics` - Get investment analytics
- `POST /api/reports/export` - Export reports

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   - Ensure Supabase project is configured
   - Run database migrations
   - Set up Row Level Security policies

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Security Features

- **Authentication**: JWT tokens with Supabase Auth
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **File Upload Security**: File type and size validation
- **CORS**: Configured for frontend domains
- **Security Headers**: Helmet.js for security headers
- **Audit Logging**: Complete audit trail for all actions

## Database Integration

The backend integrates seamlessly with the existing Supabase database schema:

- **Row Level Security**: Respects all RLS policies
- **Foreign Key Constraints**: Maintains data integrity
- **Triggers**: Utilizes database triggers for automated actions
- **Functions**: Uses database functions for complex operations

## Error Handling

- Centralized error handling middleware
- Structured error responses
- Detailed logging for debugging
- Graceful error recovery

## File Management

- Secure file upload with validation
- Integration with Supabase Storage
- File versioning for documents
- Automatic cleanup of orphaned files

## Monitoring & Logging

- Request/response logging with Morgan
- Audit trail for all database operations
- Error tracking and reporting
- Performance monitoring

## Development

The backend is designed to work seamlessly with the React frontend and provides all necessary APIs for the complete Foundation Management System functionality.