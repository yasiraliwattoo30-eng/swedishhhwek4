import React, { useState } from 'react';
import { Shield, FileText, AlertTriangle, Calendar, Users, BarChart3 } from 'lucide-react';
import { Card } from '../components/Card';
import { getGovernanceRestrictions } from '../utils/permissions';
import { RoleManagement } from '../components/governance/RoleManagement';
import { DocumentWorkflow } from '../components/governance/DocumentWorkflow';
import { ComplianceTracking } from '../components/governance/ComplianceTracking';
import { MeetingGovernance } from '../components/governance/MeetingGovernance';

type GovernanceTab = 'overview' | 'roles' | 'workflows' | 'compliance' | 'meetings';

export const GovernancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GovernanceTab>('overview');

  // Get user role and restrictions
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userRole = userData.role || 'member';
  const restrictions = getGovernanceRestrictions(userRole);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    ...(restrictions.hideRoleManagement ? [] : [{ id: 'roles', name: 'Role Management', icon: Shield }]),
    ...(restrictions.hideDocumentWorkflows ? [] : [{ id: 'workflows', name: 'Document Workflows', icon: FileText }]),
    { id: 'compliance', name: 'Compliance Tracking', icon: AlertTriangle },
    { id: 'meetings', name: 'Meeting Governance', icon: Calendar }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'roles':
        return restrictions.hideRoleManagement ? <GovernanceOverview restrictions={restrictions} /> : <RoleManagement />;
      case 'workflows':
        return restrictions.hideDocumentWorkflows ? <GovernanceOverview restrictions={restrictions} /> : <DocumentWorkflow />;
      case 'compliance':
        return <ComplianceTracking />;
      case 'meetings':
        return <MeetingGovernance />;
      default:
        return <GovernanceOverview restrictions={restrictions} />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Governance & Compliance</h1>
        <p className="text-gray-600 mt-1">Comprehensive governance tools for foundation management.</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as GovernanceTab)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

const GovernanceOverview: React.FC<{ restrictions?: any }> = ({ restrictions = {} }) => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Roles</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Compliance Issues</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Meetings This Month</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Governance Features */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {!restrictions.hideRoleBasedAccessControl && (
          <Card title="Role-Based Access Control" subtitle="Manage user permissions and governance roles">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Board Chairman</p>
                    <p className="text-sm text-gray-600">Full governance authority</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">1 user</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Board Members</p>
                    <p className="text-sm text-gray-600">Review and voting rights</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">5 users</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Secretary</p>
                    <p className="text-sm text-gray-600">Document management</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">1 user</span>
              </div>
            </div>
          </Card>
        )}

        {!restrictions.hideDocumentWorkflows && (
          <Card title="Document Workflows" subtitle="Track approval processes and digital signatures">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border-l-4 border-yellow-400 bg-yellow-50 rounded-r-lg">
                <div>
                  <p className="font-medium text-gray-900">Board Resolution - Q1 Budget</p>
                  <p className="text-sm text-gray-600">Pending chairman approval</p>
                </div>
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  Pending
                </span>
              </div>
              <div className="flex items-center justify-between p-3 border-l-4 border-green-400 bg-green-50 rounded-r-lg">
                <div>
                  <p className="font-medium text-gray-900">Annual Financial Statement</p>
                  <p className="text-sm text-gray-600">Digitally signed and approved</p>
                </div>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Completed
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
      {/* Compliance Dashboard */}
      <Card title="Compliance Dashboard" subtitle="Monitor regulatory requirements and deadlines">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="font-medium text-gray-900">Overdue Items</h3>
            <p className="text-2xl font-bold text-red-600">1</p>
            <p className="text-sm text-gray-600">Board member registration</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="font-medium text-gray-900">Due This Month</h3>
            <p className="text-2xl font-bold text-yellow-600">2</p>
            <p className="text-sm text-gray-600">Annual reports & tax filing</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">Compliant</h3>
            <p className="text-2xl font-bold text-green-600">12</p>
            <p className="text-sm text-gray-600">All other requirements</p>
          </div>
        </div>
      </Card>

      {/* Security & Audit */}
      <Card title="Security & Audit Trail" subtitle="Comprehensive logging and BankID integration">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-900">BankID signature: Annual Report approved</span>
            </div>
            <span className="text-xs text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-900">Document workflow completed: Board Resolution</span>
            </div>
            <span className="text-xs text-gray-500">1 day ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-900">New compliance deadline added: Tax filing</span>
            </div>
            <span className="text-xs text-gray-500">3 days ago</span>
          </div>
        </div>
      </Card>
    </div>
  );
};