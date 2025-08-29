# Foundation Management System

A comprehensive web application for managing foundations, built with React.js, Node.js, and Supabase.

## Features

- **Foundation Registration & Management**: Streamlined registration and document preparation
- **User Management**: Role-based access control with secure authentication
- **Document Management**: Document creation, approval workflows, and audit trails
- **Meeting Management**: Scheduling, minute creation, and distribution
- **Financial Management**: Expense processing, financial reporting, and compliance
- **Investment Tracking**: Manual and automated investment management
- **Project & Grant Management**: Tracking systems for grants and projects
- **Reporting & Dashboards**: Customizable dashboards and real-time reports
- **Mobile Support**: Mobile access for key functions
- **Multi-language Support**: Localization for multiple languages

## Tech Stack

- **Frontend**: React.js with TypeScript and Vite
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with planned BankID integration
- **Storage**: Supabase Storage for documents and files

## Database Schema

The database includes the following main tables:

- `profiles` - User profile information
- `roles` - System roles (admin, foundation_owner, member)
- `foundations` - Foundation details and registration info
- `foundation_members` - User-foundation relationships
- `documents` - Document metadata and approval status
- `document_versions` - Document version history
- `meetings` - Meeting scheduling and management
- `meeting_minutes` - Meeting minutes and decisions
- `expenses` - Financial expense tracking
- `financial_reports` - Generated financial reports
- `investments` - Investment portfolio management
- `projects` - Project tracking
- `grants` - Grant management and reporting
- `audit_logs` - System audit trail

## Getting Started

1. **Database Setup**: Run the Supabase migrations to create the database schema
2. **Environment Setup**: Configure your Supabase credentials in the `.env` file
3. **Install Dependencies**: Run `npm install` to install all required packages
4. **Start Development**: Run `npm run dev` to start the development server

## Security

The application implements comprehensive Row Level Security (RLS) policies to ensure:
- Users can only access data for foundations they belong to
- Foundation owners have management rights over their foundations
- Proper audit trails for all significant actions
- Secure file storage with access controls

## Next Steps

1. Set up the Node.js backend API
2. Implement the React.js frontend components
3. Integrate authentication and authorization
4. Add external integrations (BankID, OCR, Banking APIs)
5. Implement mobile responsiveness
6. Add multi-language support
