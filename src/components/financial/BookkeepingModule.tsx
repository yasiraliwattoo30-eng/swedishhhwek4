import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Calculator } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Input } from '../Input';
import { Modal } from '../Modal';

interface Account {
  id: string;
  account_number: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  currency: string;
  is_active: boolean;
}

interface JournalEntry {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  total_debit: number;
  total_credit: number;
  status: 'draft' | 'posted' | 'reversed';
  line_items: JournalEntryLine[];
}

interface JournalEntryLine {
  id: string;
  account_name: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
}

const mockAccounts: Account[] = [
  { id: '1', account_number: '1010', account_name: 'Cash', account_type: 'asset', balance: 150000, currency: 'SEK', is_active: true },
  { id: '2', account_number: '1020', account_name: 'Bank Account', account_type: 'asset', balance: 500000, currency: 'SEK', is_active: true },
  { id: '3', account_number: '2010', account_name: 'Accounts Payable', account_type: 'liability', balance: 25000, currency: 'SEK', is_active: true },
  { id: '4', account_number: '3010', account_name: 'Foundation Capital', account_type: 'equity', balance: 1000000, currency: 'SEK', is_active: true },
  { id: '5', account_number: '4010', account_name: 'Donation Revenue', account_type: 'revenue', balance: 200000, currency: 'SEK', is_active: true },
  { id: '6', account_number: '5010', account_name: 'Office Expenses', account_type: 'expense', balance: 15000, currency: 'SEK', is_active: true }
];

const mockJournalEntries: JournalEntry[] = [
  {
    id: '1',
    entry_number: 'JE-2024-001',
    entry_date: '2024-03-15',
    description: 'Monthly office rent payment',
    total_debit: 12000,
    total_credit: 12000,
    status: 'posted',
    line_items: [
      { id: '1', account_name: 'Office Expenses', description: 'March rent', debit_amount: 12000, credit_amount: 0 },
      { id: '2', account_name: 'Bank Account', description: 'Payment to landlord', debit_amount: 0, credit_amount: 12000 }
    ]
  },
  {
    id: '2',
    entry_number: 'JE-2024-002',
    entry_date: '2024-03-20',
    description: 'Donation received',
    total_debit: 50000,
    total_credit: 50000,
    status: 'posted',
    line_items: [
      { id: '3', account_name: 'Bank Account', description: 'Donation deposit', debit_amount: 50000, credit_amount: 0 },
      { id: '4', account_name: 'Donation Revenue', description: 'Corporate donation', debit_amount: 0, credit_amount: 50000 }
    ]
  }
];

export const BookkeepingModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'journal'>('accounts');
  const [accounts] = useState<Account[]>(mockAccounts);
  const [journalEntries] = useState<JournalEntry[]>(mockJournalEntries);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);

  const filteredAccounts = accounts.filter(account =>
    account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.account_number.includes(searchTerm)
  );

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'asset': return 'bg-green-100 text-green-800';
      case 'liability': return 'bg-red-100 text-red-800';
      case 'equity': return 'bg-blue-100 text-blue-800';
      case 'revenue': return 'bg-purple-100 text-purple-800';
      case 'expense': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'reversed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bookkeeping</h2>
          <p className="text-gray-600 mt-1">Manage chart of accounts and journal entries.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            icon={Calculator} 
            variant="secondary"
            onClick={() => setShowJournalModal(true)}
          >
            New Journal Entry
          </Button>
          <Button 
            icon={Plus}
            onClick={() => setShowAccountModal(true)}
          >
            New Account
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'accounts'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Chart of Accounts
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'journal'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Journal Entries
          </button>
        </nav>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder={`Search ${activeTab === 'accounts' ? 'accounts' : 'journal entries'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={Search}
        />
      </Card>

      {/* Chart of Accounts */}
      {activeTab === 'accounts' && (
        <Card title="Chart of Accounts" subtitle="Manage your accounting structure">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account) => (
                  <tr key={account.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {account.account_number} - {account.account_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccountTypeColor(account.account_type)}`}>
                        {account.account_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account.balance.toLocaleString('sv-SE')} {account.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        account.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {account.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" icon={Edit}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" icon={Trash2}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Journal Entries */}
      {activeTab === 'journal' && (
        <div className="space-y-6">
          {journalEntries.map((entry) => (
            <Card key={entry.id}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{entry.entry_number}</h3>
                  <p className="text-sm text-gray-600">{entry.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Date: {new Date(entry.entry_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(entry.status)}`}>
                    {entry.status}
                  </span>
                  <Button variant="ghost" size="sm" icon={Edit}>
                    Edit
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Account
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Description
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Debit
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Credit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {entry.line_items.map((line) => (
                      <tr key={line.id}>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {line.account_name}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {line.description}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">
                          {line.debit_amount > 0 ? line.debit_amount.toLocaleString('sv-SE') : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">
                          {line.credit_amount > 0 ? line.credit_amount.toLocaleString('sv-SE') : '-'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="px-4 py-2 text-sm text-gray-900" colSpan={2}>
                        Total
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">
                        {entry.total_debit.toLocaleString('sv-SE')}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">
                        {entry.total_credit.toLocaleString('sv-SE')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Account Modal */}
      <Modal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        title="Create New Account"
        size="md"
      >
        <AccountForm onClose={() => setShowAccountModal(false)} />
      </Modal>

      {/* Journal Entry Modal */}
      <Modal
        isOpen={showJournalModal}
        onClose={() => setShowJournalModal(false)}
        title="Create Journal Entry"
        size="lg"
      >
        <JournalEntryForm onClose={() => setShowJournalModal(false)} />
      </Modal>
    </div>
  );
};

const AccountForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    account_number: '',
    account_name: '',
    account_type: '',
    currency: 'SEK'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Account Number"
          value={formData.account_number}
          onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
          placeholder="e.g., 1010"
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Type
          </label>
          <select
            value={formData.account_type}
            onChange={(e) => setFormData(prev => ({ ...prev, account_type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="">Select Type</option>
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
            <option value="equity">Equity</option>
            <option value="revenue">Revenue</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      <Input
        label="Account Name"
        value={formData.account_name}
        onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
        placeholder="e.g., Cash"
        required
      />

      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Create Account
        </Button>
      </div>
    </form>
  );
};

const JournalEntryForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    description: '',
    line_items: [
      { account_name: '', description: '', debit_amount: 0, credit_amount: 0 },
      { account_name: '', description: '', debit_amount: 0, credit_amount: 0 }
    ]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onClose();
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      line_items: [...prev.line_items, { account_name: '', description: '', debit_amount: 0, credit_amount: 0 }]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Entry Date"
          type="date"
          value={formData.entry_date}
          onChange={(e) => setFormData(prev => ({ ...prev, entry_date: e.target.value }))}
          required
        />
        <Input
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Journal entry description"
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Line Items
          </label>
          <Button type="button" size="sm" onClick={addLineItem}>
            Add Line
          </Button>
        </div>
        
        <div className="space-y-2">
          {formData.line_items.map((line, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 p-2 border rounded">
              <input
                placeholder="Account"
                className="px-2 py-1 border rounded text-sm"
                value={line.account_name}
                onChange={(e) => {
                  const newLines = [...formData.line_items];
                  newLines[index].account_name = e.target.value;
                  setFormData(prev => ({ ...prev, line_items: newLines }));
                }}
              />
              <input
                placeholder="Description"
                className="px-2 py-1 border rounded text-sm"
                value={line.description}
                onChange={(e) => {
                  const newLines = [...formData.line_items];
                  newLines[index].description = e.target.value;
                  setFormData(prev => ({ ...prev, line_items: newLines }));
                }}
              />
              <input
                type="number"
                placeholder="Debit"
                className="px-2 py-1 border rounded text-sm"
                value={line.debit_amount || ''}
                onChange={(e) => {
                  const newLines = [...formData.line_items];
                  newLines[index].debit_amount = parseFloat(e.target.value) || 0;
                  setFormData(prev => ({ ...prev, line_items: newLines }));
                }}
              />
              <input
                type="number"
                placeholder="Credit"
                className="px-2 py-1 border rounded text-sm"
                value={line.credit_amount || ''}
                onChange={(e) => {
                  const newLines = [...formData.line_items];
                  newLines[index].credit_amount = parseFloat(e.target.value) || 0;
                  setFormData(prev => ({ ...prev, line_items: newLines }));
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Create Entry
        </Button>
      </div>
    </form>
  );
};