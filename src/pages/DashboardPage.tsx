import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight, CheckCircle, Clock, AlertCircle, FileText, Calendar } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ExpensesPieChart, InvestmentsPieChart, FinancialTrendsChart, ComplianceStatusChart } from '../components/charts/DashboardCharts';
import { mockFoundations, mockRecentActivities } from '../data/mockData';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  
  // Get user data from localStorage for demo
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userRole = userData.role || 'member';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending_verification':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('dashboard')}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {t('welcomeBack')} 
            {userData.full_name && (
              <span className="font-medium"> {userData.full_name}</span>
            )}
            {userRole && (
              <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                userRole === 'admin' ? 'bg-red-100 text-red-800' :
                userRole === 'foundation_owner' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {userRole.replace('_', ' ')}
              </span>
            )}
          </p>
        </div>
        {(userRole === 'admin' || userRole === 'foundation_owner') && (
          <Link to="/foundations/new">
            <Button icon={Plus} className="text-sm">
              <span className="hidden sm:inline">New Foundation</span>
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Role-specific welcome message */}
      {userRole === 'admin' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <h3 className="text-sm font-medium text-red-900">System Administrator Access</h3>
          </div>
          <p className="text-sm text-red-700 mt-1">
            You have full system access including user management, system settings, and all foundation data.
          </p>
        </div>
      )}

      {userRole === 'foundation_owner' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <h3 className="text-sm font-medium text-yellow-900">Notice: Manager Dashboard Available</h3>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            As a Foundation Manager, you have access to a dedicated Manager Dashboard with enhanced management tools.
            <Link to="/manager-dashboard" className="ml-2 font-medium text-yellow-800 hover:text-yellow-900 underline">
              Switch to Manager Dashboard
            </Link>
          </p>
        </div>
      )}

      {userRole === 'member' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <h3 className="text-sm font-medium text-yellow-900">Member Access</h3>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            You have access to view documents, submit expenses, and participate in meetings.
          </p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">{t('activeFoundations')}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {mockFoundations.filter(f => f.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">{t('pendingVerification')}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {mockFoundations.filter(f => f.status === 'pending_verification').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Documents</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">{t('upcomingMeetings')}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <ExpensesPieChart />
        <InvestmentsPieChart />
      </div>
      
      <FinancialTrendsChart />
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <ComplianceStatusChart />
        
        {/* My Foundations */}
        <Card
          title={t('myFoundations')}
          subtitle="Foundations you own or are a member of"
          actions={
            <Link to="/foundations">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          }
        >
          <div className="space-y-4">
            {mockFoundations.map((foundation) => (
              <div key={foundation.id} className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(foundation.status)}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{foundation.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{foundation.registration_number}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(foundation.status)}`}>
                    {foundation.status.replace('_', ' ')}
                  </span>
                  <Link to={`/foundations/${foundation.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs">
                      <span className="hidden sm:inline">View</span>
                      <span className="sm:hidden">→</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Recent Activities - Full Width */}
        <Card
          title={t('recentActivities')}
          subtitle="Latest updates across your foundations"
        >
          <div className="space-y-4">
            {mockRecentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-2 sm:p-0">
                <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 break-words">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {activity.foundation_name} • {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};