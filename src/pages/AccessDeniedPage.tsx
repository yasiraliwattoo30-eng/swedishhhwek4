import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { getDefaultRoute } from '../utils/permissions';

export const AccessDeniedPage: React.FC = () => {
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userRole = userData.role || 'member';
  const defaultRoute = getDefaultRoute(userRole);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page. Your current role ({userRole.replace('_', ' ')}) 
              doesn't include access to this feature.
            </p>
            
            <div className="space-y-3">
              <Link to={defaultRoute}>
                <Button className="w-full" icon={Home}>
                  Go to Dashboard
                </Button>
              </Link>
              <Link to={window.history.length > 1 ? -1 : defaultRoute}>
                <Button variant="secondary" className="w-full" icon={ArrowLeft}>
                  Go Back
                </Button>
              </Link>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Need Access?</h3>
              <p className="text-sm text-blue-800">
                Contact your foundation administrator or system admin to request additional permissions.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};