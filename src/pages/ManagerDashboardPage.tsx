import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Calculator, Calendar, DollarSign, FolderOpen, Gift, BarChart3, ArrowRight, TrendingUp, Users, FileText, CheckCircle } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ExpensesPieChart, InvestmentsPieChart, FinancialTrendsChart } from '../components/charts/DashboardCharts';
import { mockFoundations, mockRecentActivities } from '../data/mockData';

export const ManagerDashboardPage: React.FC = () => {
  // Get user data from localStorage for demo
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {userData.full_name || 'Foundation Manager'}! Manage your foundation operations efficiently.
          </p>
        </div>
      </div>

      {/* Manager Role Welcome */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <h3 className="text-sm font-medium text-blue-900">Foundation Manager Access</h3>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          You have comprehensive management access including governance, financial operations, and reporting capabilities.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">1.75M SEK</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
              <p className="text-2xl font-bold text-gray-900">53K SEK</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" subtitle="Access key management functions">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link to="/governance">
            <Button variant="secondary" className="w-full flex-col h-20" size="sm">
              <Shield className="w-6 h-6 mb-1" />
              <span className="text-xs">Governance</span>
            </Button>
          </Link>
          <Link to="/financial">
            <Button variant="secondary" className="w-full flex-col h-20" size="sm">
              <Calculator className="w-6 h-6 mb-1" />
              <span className="text-xs">Financial</span>
            </Button>
          </Link>
          <Link to="/meetings">
            <Button variant="secondary" className="w-full flex-col h-20" size="sm">
              <Calendar className="w-6 h-6 mb-1" />
              <span className="text-xs">Meetings</span>
            </Button>
          </Link>
          <Link to="/expenses">
            <Button variant="secondary" className="w-full flex-col h-20" size="sm">
              <DollarSign className="w-6 h-6 mb-1" />
              <span className="text-xs">Expenses</span>
            </Button>
          </Link>
          <Link to="/projects">
            <Button variant="secondary" className="w-full flex-col h-20" size="sm">
              <FolderOpen className="w-6 h-6 mb-1" />
              <span className="text-xs">Projects</span>
            </Button>
          </Link>
          <Link to="/reports">
            <Button variant="secondary" className="w-full flex-col h-20" size="sm">
              <BarChart3 className="w-6 h-6 mb-1" />
              <span className="text-xs">Reports</span>
            </Button>
          </Link>
        </div>
      </Card>

      {/* Foundation Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card
          title="My Foundations"
          subtitle="Foundations under your management"
          actions={
            <Link to="/foundations">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          }
        >
          <div className="space-y-4">
            {mockFoundations.map((foundation) => (
              <div key={foundation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    foundation.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <h4 className="font-medium text-gray-900">{foundation.name}</h4>
                    <p className="text-sm text-gray-600">{foundation.registration_number}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    foundation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {foundation.status.replace('_', ' ')}
                  </span>
                  <Link to={`/foundations/${foundation.id}`}>
                    <Button variant="ghost" size="sm">
                      Manage
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Actions */}
        <Card title="Pending Actions" subtitle="Items requiring your attention">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">Expense Approvals</p>
                  <p className="text-sm text-gray-600">3 expenses awaiting approval</p>
                </div>
              </div>
              <Link to="/expenses?status=pending">
                <Button size="sm">Review</Button>
              </Link>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Document Reviews</p>
                  <p className="text-sm text-gray-600">2 documents pending review</p>
                </div>
              </div>
              <Link to="/documents?status=pending_approval">
                <Button size="sm">Review</Button>
              </Link>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Upcoming Meetings</p>
                  <p className="text-sm text-gray-600">Board meeting in 3 days</p>
                </div>
              </div>
              <Link to="/meetings">
                <Button size="sm">View</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Financial Overview Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ExpensesPieChart />
        <InvestmentsPieChart />
      </div>

      <FinancialTrendsChart />

      {/* Recent Activities */}
      <Card title="Recent Activities" subtitle="Latest updates across your foundations">
        <div className="space-y-4">
          {mockRecentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.foundation_name} • {new Date(activity.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Management Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Governance Tools" subtitle="Manage foundation governance">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Compliance Items</span>
              <span className="text-sm font-medium text-gray-900">15 active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Document Workflows</span>
              <span className="text-sm font-medium text-gray-900">2 pending</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Meeting Minutes</span>
              <span className="text-sm font-medium text-gray-900">1 draft</span>
            </div>
          </div>
          <Link to="/governance" className="block mt-4">
            <Button variant="secondary" className="w-full">
              Manage Governance
            </Button>
          </Link>
        </Card>

        <Card title="Financial Overview" subtitle="Key financial metrics">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bank Accounts</span>
              <span className="text-sm font-medium text-gray-900">2 connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Unreconciled</span>
              <span className="text-sm font-medium text-yellow-600">3 transactions</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Monthly Budget</span>
              <span className="text-sm font-medium text-gray-900">85% used</span>
            </div>
          </div>
          <Link to="/financial" className="block mt-4">
            <Button variant="secondary" className="w-full">
              Manage Finances
            </Button>
          </Link>
        </Card>

        <Card title="Project Status" subtitle="Active project overview">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Projects</span>
              <span className="text-sm font-medium text-gray-900">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Grant Applications</span>
              <span className="text-sm font-medium text-gray-900">2 pending</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Progress</span>
              <span className="text-sm font-medium text-gray-900">67%</span>
            </div>
          </div>
          <Link to="/projects" className="block mt-4">
            <Button variant="secondary" className="w-full">
              Manage Projects
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};