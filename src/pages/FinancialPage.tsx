import React, { useState } from 'react';
import { Calculator, FileText, CreditCard, Users, Shield, Building, TrendingUp, DollarSign } from 'lucide-react';
import { Card } from '../components/Card';
import { BookkeepingModule } from '../components/financial/BookkeepingModule';
import { InvoicingModule } from '../components/financial/InvoicingModule';
import { SupplierInvoiceApproval } from '../components/financial/SupplierInvoiceApproval';
import { BankIDAuthentication } from '../components/financial/BankIDAuthentication';
import { PayrollModule } from '../components/financial/PayrollModule';
import { BankIntegration } from '../components/financial/BankIntegration';

type FinancialTab = 'overview' | 'bookkeeping' | 'invoicing' | 'supplier-invoices' | 'payroll' | 'bank-integration' | 'bankid' | 'expense-management';

export const FinancialPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinancialTab>('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'bookkeeping', name: 'Bookkeeping', icon: Calculator },
    { id: 'expense-management', name: 'Expenses', icon: DollarSign }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'bookkeeping':
        return <BookkeepingModule />;
      case 'invoicing':
        return <InvoicingModule />;
      case 'supplier-invoices':
        return <SupplierInvoiceApproval />;
      case 'payroll':
        return <PayrollModule />;
      case 'bank-integration':
        return <BankIntegration />;
      case 'bankid':
        return <BankIDAuthentication />;
      case 'expense-management':
        return <ExpenseManagementPlaceholder />;
      default:
        return <FinancialOverview />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
        <p className="text-gray-600 mt-1">Comprehensive financial tools for Swedish foundations.</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FinancialTab)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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

const FinancialOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">1,750,000 SEK</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Outstanding Invoices</p>
              <p className="text-2xl font-bold text-gray-900">156,250 SEK</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-yellow-600" />
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
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Payroll</p>
              <p className="text-2xl font-bold text-gray-900">129,000 SEK</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Financial Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Bookkeeping & Accounting" subtitle="Double-entry bookkeeping with Swedish standards">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calculator className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Chart of Accounts</p>
                  <p className="text-sm text-gray-600">BAS-compliant account structure</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">45 accounts</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Journal Entries</p>
                  <p className="text-sm text-gray-600">Automated and manual entries</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">127 entries</span>
            </div>
          </div>
        </Card>

        <Card title="Invoicing System" subtitle="Professional invoicing with Swedish tax compliance">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border-l-4 border-blue-400 bg-blue-50 rounded-r-lg">
              <div>
                <p className="font-medium text-gray-900">Sales Invoices</p>
                <p className="text-sm text-gray-600">2 sent, 156,250 SEK outstanding</p>
              </div>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-green-400 bg-green-50 rounded-r-lg">
              <div>
                <p className="font-medium text-gray-900">Purchase Invoices</p>
                <p className="text-sm text-gray-600">Automated processing & approval</p>
              </div>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Automated
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* BankID & Security */}
      <Card title="Security & Authentication" subtitle="BankID integration for secure financial operations">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">BankID Authentication</h3>
            <p className="text-sm text-gray-600">Secure user verification for financial transactions</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">Digital Signatures</h3>
            <p className="text-sm text-gray-600">Legally binding signatures for invoices and contracts</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Building className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900">Audit Trails</h3>
            <p className="text-sm text-gray-600">Complete financial activity logging and compliance</p>
          </div>
        </div>
      </Card>

      {/* Bank Integration */}
      <Card title="Bank Integration" subtitle="Connect with Swedish banks for automated transaction import">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-900">Swedbank - Foundation Operating Account</span>
            </div>
            <span className="text-sm font-medium text-gray-900">1,250,000 SEK</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-900">Handelsbanken - Foundation Savings</span>
            </div>
            <span className="text-sm font-medium text-gray-900">500,000 SEK</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-900">3 unreconciled transactions</span>
            </div>
            <span className="text-xs text-gray-500">Requires attention</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ExpenseManagementPlaceholder: React.FC = () => {
  return (
    <div className="text-center py-12">
      <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Expense Management</h3>
      <p className="text-gray-600 mb-4">
        Enhanced expense management module will be integrated here, building upon the existing expense tracking functionality.
      </p>
      <p className="text-sm text-gray-500">
        This will include receipt scanning, automated categorization, approval workflows, and integration with the bookkeeping system.
      </p>
    </div>
  );
};