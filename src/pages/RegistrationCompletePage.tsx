import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, FileText, Building2, Users, Settings } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const RegistrationCompletePage: React.FC = () => {
  const submissionReference = `REF-${Date.now()}`;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">FAASINOVA</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Foundation Registration Submitted Successfully!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your foundation registration has been submitted to Swedish authorities. 
            You now have limited access to the system while awaiting verification.
          </p>
        </div>

        {/* Submission Details */}
        <Card className="mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Submission Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Submission Reference</p>
                <p className="text-lg font-mono font-semibold text-gray-900">{submissionReference}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Submitted Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleDateString('sv-SE')}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">What Happens Next</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-blue-600">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Authority Review</h3>
                <p className="text-sm text-gray-600">
                  Länsstyrelsen will review your application (typically 4-8 weeks)
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-yellow-600">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Additional Requirements</h3>
                <p className="text-sm text-gray-600">
                  You may be contacted for additional information or documentation
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-green-600">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Approval & Verification</h3>
                <p className="text-sm text-gray-600">
                  Upon approval, your foundation will be officially registered and verified
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-purple-600">4</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Full System Access</h3>
                <p className="text-sm text-gray-600">
                  Complete access to all financial and operational tools will be granted
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Limited Access Information */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Available During Registration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">User Management</h3>
              <p className="text-sm text-gray-600 mt-1">
                Add and manage board member accounts
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">Meeting Planning</h3>
              <p className="text-sm text-gray-600 mt-1">
                Schedule and plan initial board meetings
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">Basic Setup</h3>
              <p className="text-sm text-gray-600 mt-1">
                Configure foundation settings and preferences
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <Link to="/dashboard-limited">
            <Button size="lg" className="w-full md:w-auto">
              Access Limited Dashboard
            </Button>
          </Link>
          <p className="text-sm text-gray-600">
            You can start setting up your foundation while awaiting official verification
          </p>
        </div>

        {/* Contact Information */}
        <Card className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Registration Support</h3>
              <p className="text-sm text-gray-600 mb-2">
                If you have questions about the registration process or need assistance:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Email: support@faasinova.se</li>
                <li>• Phone: +46 8 123 456 78</li>
                <li>• Business hours: Mon-Fri 9:00-17:00</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Authority Contact</h3>
              <p className="text-sm text-gray-600 mb-2">
                For questions about your application status:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Länsstyrelsen: lansstyrelsen.se</li>
                <li>• Reference: {submissionReference}</li>
                <li>• Expected response: 4-8 weeks</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};