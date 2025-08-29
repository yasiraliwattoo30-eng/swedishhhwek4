import React from 'react';
import { Clock, Users, Calendar, Settings, AlertTriangle, CheckCircle, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const LimitedDashboardPage: React.FC = () => {
  const submissionReference = `REF-${Date.now()}`;
  const submissionDate = new Date().toLocaleDateString('sv-SE');
  
  return (
    <div className="space-y-6">
      {/* Registration Status Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <Clock className="w-6 h-6 text-yellow-600 mt-1" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">
              Foundation Registration Under Review
            </h2>
            <p className="text-yellow-800 mb-4">
              Your foundation registration has been submitted to Swedish authorities and is currently under review. 
              You have limited access to the system until verification is complete.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Submission Reference:</span> {submissionReference}
              </div>
              <div>
                <span className="font-medium">Submitted:</span> {submissionDate}
              </div>
              <div>
                <span className="font-medium">Expected Response:</span> 4-8 weeks
              </div>
              <div>
                <span className="font-medium">Status:</span> Under Review
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Foundation Setup</h1>
          <p className="text-gray-600 mt-1">Prepare your foundation while awaiting official verification.</p>
        </div>
      </div>

      {/* Available Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Management */}
        <Card>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
            <p className="text-gray-600 mb-4">
              Add board members and assign initial roles for your foundation.
            </p>
            <Link to="/limited/users">
              <Button className="w-full">
                Manage Users
              </Button>
            </Link>
          </div>
        </Card>

        {/* Meeting Planning */}
        <Card>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Meeting Planning</h3>
            <p className="text-gray-600 mb-4">
              Schedule initial board meetings and prepare governance structure.
            </p>
            <Link to="/limited/meetings">
              <Button className="w-full">
                Plan Meetings
              </Button>
            </Link>
          </div>
        </Card>

        {/* Basic Settings */}
        <Card>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Foundation Setup</h3>
            <p className="text-gray-600 mb-4">
              Configure basic foundation settings and preferences.
            </p>
            <Link to="/limited/settings">
              <Button className="w-full">
                Configure Settings
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Registration Progress */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Registration Progress</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <h3 className="font-medium text-gray-900">Application Submitted</h3>
              <p className="text-sm text-gray-600">Foundation registration submitted to Länsstyrelsen</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
            <Clock className="w-6 h-6 text-yellow-500" />
            <div>
              <h3 className="font-medium text-gray-900">Under Authority Review</h3>
              <p className="text-sm text-gray-600">Länsstyrelsen is reviewing your application</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <Clock className="w-6 h-6 text-gray-400" />
            <div>
              <h3 className="font-medium text-gray-500">Awaiting Approval</h3>
              <p className="text-sm text-gray-500">Official foundation registration pending</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <Clock className="w-6 h-6 text-gray-400" />
            <div>
              <h3 className="font-medium text-gray-500">Full System Access</h3>
              <p className="text-sm text-gray-500">Complete financial and operational tools (after verification)</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Restricted Features Notice */}
      <Card>
        <div className="flex items-start space-x-4">
          <AlertTriangle className="w-6 h-6 text-yellow-500 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Limited Access Notice</h2>
            <p className="text-gray-600 mb-4">
              Until your foundation is officially verified by Swedish authorities, access to the following features is restricted:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Financial Modules:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Bookkeeping & Accounting</li>
                  <li>• Invoicing System</li>
                  <li>• Bank Integration</li>
                  <li>• Payroll Management</li>
                  <li>• Investment Tracking</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Operational Tools:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Project Management</li>
                  <li>• Grant Applications</li>
                  <li>• Financial Reporting</li>
                  <li>• Document Management</li>
                  <li>• Compliance Tracking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Contact Support */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Assistance?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Registration Support</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Email: registration@faasinova.se</li>
              <li>Phone: +46 8 123 456 78</li>
              <li>Hours: Mon-Fri 9:00-17:00</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Authority Status</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Länsstyrelsen: lansstyrelsen.se</li>
              <li>Reference: {submissionReference}</li>
              <li>Status updates via email</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};