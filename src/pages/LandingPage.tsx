import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, LogIn, UserPlus, Shield, FileText, Users } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">FAASINOVA</span>
            </div>
            <div className="text-sm text-gray-600">
              Foundation Management System
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Swedish Foundation Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Streamline your foundation operations with comprehensive governance, financial management, 
            and regulatory compliance tools designed specifically for Swedish foundations.
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Login to Existing Foundation */}
          <Card className="text-center p-8 hover:shadow-lg transition-shadow duration-300">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Your Foundation
            </h2>
            <p className="text-gray-600 mb-6">
              Log in to manage your existing foundation's operations, finances, governance, 
              and compliance activities.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="w-4 h-4 mr-2 text-green-500" />
                <span>Secure BankID authentication</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="w-4 h-4 mr-2 text-blue-500" />
                <span>Complete governance tools</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2 text-purple-500" />
                <span>Role-based access control</span>
              </div>
            </div>
            <Link to="/login" className="block mt-6">
              <Button className="w-full" size="lg">
                Login to Foundation
              </Button>
            </Link>
          </Card>

          {/* Register New Foundation */}
          <Card className="text-center p-8 hover:shadow-lg transition-shadow duration-300 border-2 border-primary-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserPlus className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Register New Foundation
            </h2>
            <p className="text-gray-600 mb-6">
              Start the process of establishing a new foundation in Sweden with guided 
              registration, document generation, and authority submission.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="w-4 h-4 mr-2 text-green-500" />
                <span>Automated document generation</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="w-4 h-4 mr-2 text-blue-500" />
                <span>Compliance verification</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2 text-purple-500" />
                <span>Authority submission</span>
              </div>
            </div>
            <Link to="/register-foundation" className="block mt-6">
              <Button className="w-full" size="lg" variant="secondary">
                Register Foundation
              </Button>
            </Link>
          </Card>
        </div>

        {/* Features Overview */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Comprehensive Foundation Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Governance & Compliance</h3>
              <p className="text-gray-600">
                Role-based access control, document workflows, compliance tracking, 
                and meeting management with digital signatures.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Management</h3>
              <p className="text-gray-600">
                Double-entry bookkeeping, invoicing, payroll, expense management, 
                and bank integration with Swedish compliance.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Operations & Reporting</h3>
              <p className="text-gray-600">
                Project management, investment tracking, grant management, 
                and comprehensive reporting with audit trails.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 FAASINOVA. Swedish Foundation Management System.</p>
            <p className="text-sm mt-2">
              Compliant with Länsstyrelsen, Skatteverket, and Bolagsverket regulations.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};