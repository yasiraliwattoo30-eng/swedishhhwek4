import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Calculator, Save, X } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Input } from '../Input';
import { Modal } from '../Modal';
import { apiService, Account, JournalEntry, CreateAccountData, CreateJournalEntryData } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export const BookkeepingModule: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'accounts' | 'journal'>('accounts');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingJournalEntry, setEditingJournalEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Load data on component mount
  React.useEffect(() => {
    loadAccounts();
    loadJournalEntries();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    const response = await apiService.getAccounts();
    if (response.success && response.data) {
      setAccounts(response.data);
    } else {
      setError(response.error || 'Failed to load accounts');
    }
    setLoading(false);
  };

  const loadJournalEntries = async () => {
    setLoading(true);
    const response = await apiService.getJournalEntries();
    if (response.success && response.data) {
      setJournalEntries(response.data);
    } else {
      setError(response.error || 'Failed to load journal entries');
    }
    setLoading(false);
  };

  const handleCreateAccount = async (accountData: CreateAccountData) => {
    const response = await apiService.createAccount(accountData);
    if (response.success) {
      await loadAccounts();
      setShowAccountModal(false);
    } else {
      setError(response.error || 'Failed to create account');
    }
  };

  const handleUpdateAccount = async (id: string, updates: Partial<Account>) => {
    const response = await apiService.updateAccount(id, updates);
    if (response.success) {
      await loadAccounts();
      setEditingAccount(null);
    } else {
      setError(response.error || 'Failed to update account');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      const response = await apiService.deleteAccount(id);
      if (response.success) {
        await loadAccounts();
      } else {
        setError(response.error || 'Failed to delete account');
      }
    }
  };

  const handleCreateJournalEntry = async (entryData: CreateJournalEntryData) => {
    const response = await apiService.createJournalEntry(entryData);
    if (response.success) {
      await loadJournalEntries();
      await loadAccounts(); // Refresh accounts to show updated balances
      setShowJournalModal(false);
    } else {
      setError(response.error || 'Failed to create journal entry');
    }
  };

  const handleUpdateJournalEntry = async (id: string, updates: Partial<JournalEntry>) => {
    const response = await apiService.updateJournalEntry(id, updates);
    if (response.success) {
      await loadJournalEntries();
      setEditingJournalEntry(null);
    } else {
      setError(response.error || 'Failed to update journal entry');
    }
  };

  const handleDeleteJournalEntry = async (id: string) => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      const response = await apiService.deleteJournalEntry(id);
      if (response.success) {
        await loadJournalEntries();
        await loadAccounts(); // Refresh accounts to show updated balances
      } else {
        setError(response.error || 'Failed to delete journal entry');
      }
    }
  };

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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setError('')}
            className="mt-2"
          >
            Dismiss
          </Button>
        </div>
      )}

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
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading accounts...</p>
            </div>
          ) : (
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
                  <AccountRow
                    key={account.id}
                    account={account}
                    isEditing={editingAccount?.id === account.id}
                    onEdit={() => setEditingAccount(account)}
                    onSave={(updates) => handleUpdateAccount(account.id, updates)}
                    onCancel={() => setEditingAccount(null)}
                    onDelete={() => handleDeleteAccount(account.id)}
                    getAccountTypeColor={getAccountTypeColor}
                  />
                ))}
              </tbody>
            </table>
          </div>
          )}
        </Card>
      )}

      {/* Journal Entries */}
      {activeTab === 'journal' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading journal entries...</p>
            </div>
          ) : (
            journalEntries.map((entry) => (
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      icon={Edit}
                      onClick={() => setEditingJournalEntry(entry)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      icon={Trash2}
                      onClick={() => handleDeleteJournalEntry(entry.id)}
                    >
                      Delete
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
                      {entry.line_items?.map((line) => (
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
            ))
          )}
        </div>
      )}

      {/* Account Modal */}
      <Modal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        title="Create New Account"
        size="md"
      >
        <AccountForm 
          onSubmit={handleCreateAccount}
          onClose={() => setShowAccountModal(false)} 
        />
      </Modal>

      {/* Journal Entry Modal */}
      <Modal
        isOpen={showJournalModal}
        onClose={() => setShowJournalModal(false)}
        title="Create Journal Entry"
        size="lg"
      >
        <JournalEntryForm 
          accounts={accounts}
          onSubmit={handleCreateJournalEntry}
          onClose={() => setShowJournalModal(false)} 
        />
      </Modal>

      {/* Edit Journal Entry Modal */}
      <Modal
        isOpen={!!editingJournalEntry}
        onClose={() => setEditingJournalEntry(null)}
        title="Edit Journal Entry"
        size="lg"
      >
        {editingJournalEntry && (
          <JournalEntryEditForm 
            entry={editingJournalEntry}
            accounts={accounts}
            onSubmit={(updates) => handleUpdateJournalEntry(editingJournalEntry.id, updates)}
            onClose={() => setEditingJournalEntry(null)} 
          />
        )}
      </Modal>
    </div>
  );
};

// Account Row Component with inline editing
const AccountRow: React.FC<{
  account: Account;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<Account>) => void;
  onCancel: () => void;
  onDelete: () => void;
  getAccountTypeColor: (type: string) => string;
}> = ({ account, isEditing, onEdit, onSave, onCancel, onDelete, getAccountTypeColor }) => {
  const [editData, setEditData] = useState({
    account_name: account.account_name,
    account_type: account.account_type,
    is_active: account.is_active
  });

  const handleSave = () => {
    onSave(editData);
  };

  if (isEditing) {
    return (
      <tr>
        <td className="px-6 py-4 whitespace-nowrap">
          <div>
            <div className="text-sm font-medium text-gray-900">
              {account.account_number} - 
              <input
                type="text"
                value={editData.account_name}
                onChange={(e) => setEditData(prev => ({ ...prev, account_name: e.target.value }))}
                className="ml-1 border border-gray-300 rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <select
            value={editData.account_type}
            onChange={(e) => setEditData(prev => ({ ...prev, account_type: e.target.value as any }))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
            <option value="equity">Equity</option>
            <option value="revenue">Revenue</option>
            <option value="expense">Expense</option>
          </select>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {account.balance.toLocaleString('sv-SE')} {account.currency}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={editData.is_active}
              onChange={(e) => setEditData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm">Active</span>
          </label>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" icon={Save} onClick={handleSave}>
            </Button>
            <Button variant="ghost" size="sm" icon={X} onClick={onCancel}>
            </Button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
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
          <Button variant="ghost" size="sm" icon={Edit} onClick={onEdit}>
          </Button>
          <Button variant="ghost" size="sm" icon={Trash2} onClick={onDelete}>
          </Button>
        </div>
      </td>
    </tr>
  );
};

const AccountForm: React.FC<{ 
  onSubmit: (data: CreateAccountData) => void;
  onClose: () => void;
}> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState<CreateAccountData>({
    foundation_id: '',
    account_number: '',
    account_name: '',
    account_type: 'asset',
    currency: 'SEK'
  });
  const [loading, setLoading] = useState(false);
  const [foundations, setFoundations] = useState<any[]>([]);

  React.useEffect(() => {
    loadFoundations();
  }, []);

  const loadFoundations = async () => {
    const response = await apiService.getFoundations();
    if (response.success && response.data) {
      setFoundations(response.data);
      if (response.data.length === 1) {
        setFormData(prev => ({ ...prev, foundation_id: response.data[0].id }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Foundation
        </label>
        <select
          value={formData.foundation_id}
          onChange={(e) => setFormData(prev => ({ ...prev, foundation_id: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        >
          <option value="">Select Foundation</option>
          {foundations.map((foundation) => (
            <option key={foundation.id} value={foundation.id}>
              {foundation.name}
            </option>
          ))}
        </select>
      </div>

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
            onChange={(e) => setFormData(prev => ({ ...prev, account_type: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
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
        <Button type="submit" loading={loading}>
          Create Account
        </Button>
      </div>
    </form>
  );
};

const JournalEntryForm: React.FC<{ 
  accounts: Account[];
  onSubmit: (data: CreateJournalEntryData) => void;
  onClose: () => void;
}> = ({ accounts, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<CreateJournalEntryData>({
    foundation_id: '',
    entry_date: new Date().toISOString().split('T')[0],
    description: '',
    line_items: [
      { account_id: '', description: '', debit_amount: 0, credit_amount: 0 },
      { account_id: '', description: '', debit_amount: 0, credit_amount: 0 }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [foundations, setFoundations] = useState<any[]>([]);

  React.useEffect(() => {
    loadFoundations();
  }, []);

  const loadFoundations = async () => {
    const response = await apiService.getFoundations();
    if (response.success && response.data) {
      setFoundations(response.data);
      if (response.data.length === 1) {
        setFormData(prev => ({ ...prev, foundation_id: response.data[0].id }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate balanced entry
    const totalDebit = formData.line_items.reduce((sum, item) => sum + item.debit_amount, 0);
    const totalCredit = formData.line_items.reduce((sum, item) => sum + item.credit_amount, 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      alert('Journal entry must be balanced (debits must equal credits)');
      return;
    }

    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      line_items: [...prev.line_items, { account_id: '', description: '', debit_amount: 0, credit_amount: 0 }]
    }));
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      line_items: prev.line_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeLineItem = (index: number) => {
    if (formData.line_items.length > 2) {
      setFormData(prev => ({
        ...prev,
        line_items: prev.line_items.filter((_, i) => i !== index)
      }));
    }
  };

  const totalDebit = formData.line_items.reduce((sum, item) => sum + item.debit_amount, 0);
  const totalCredit = formData.line_items.reduce((sum, item) => sum + item.credit_amount, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Foundation
        </label>
        <select
          value={formData.foundation_id}
          onChange={(e) => setFormData(prev => ({ ...prev, foundation_id: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        >
          <option value="">Select Foundation</option>
          {foundations.map((foundation) => (
            <option key={foundation.id} value={foundation.id}>
              {foundation.name}
            </option>
          ))}
        </select>
      </div>

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
            <div key={index} className="grid grid-cols-5 gap-2 p-2 border rounded">
              <select
                value={line.account_id}
                onChange={(e) => updateLineItem(index, 'account_id', e.target.value)}
                className="px-2 py-1 border rounded text-sm"
                required
              >
                <option value="">Select Account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_number} - {account.account_name}
                  </option>
                ))}
              </select>
              <input
                placeholder="Description"
                className="px-2 py-1 border rounded text-sm"
                value={line.description}
                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Debit"
                className="px-2 py-1 border rounded text-sm"
                value={line.debit_amount || ''}
                onChange={(e) => updateLineItem(index, 'debit_amount', parseFloat(e.target.value) || 0)}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Credit"
                className="px-2 py-1 border rounded text-sm"
                value={line.credit_amount || ''}
                onChange={(e) => updateLineItem(index, 'credit_amount', parseFloat(e.target.value) || 0)}
              />
              {formData.line_items.length > 2 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeLineItem(index)}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-2 p-2 bg-gray-50 rounded">
          <div className="flex justify-between text-sm">
            <span>Total Debits: {totalDebit.toLocaleString('sv-SE')}</span>
            <span>Total Credits: {totalCredit.toLocaleString('sv-SE')}</span>
          </div>
          <div className={`text-center text-sm font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
            {isBalanced ? '✓ Balanced' : '⚠ Not Balanced'}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} disabled={!isBalanced}>
          Create Entry
        </Button>
      </div>
    </form>
  );
};

const JournalEntryEditForm: React.FC<{
  entry: JournalEntry;
  accounts: Account[];
  onSubmit: (updates: Partial<JournalEntry>) => void;
  onClose: () => void;
}> = ({ entry, accounts, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    description: entry.description,
    status: entry.status
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{entry.entry_number}</h3>
        <p className="text-sm text-gray-600">Date: {new Date(entry.entry_date).toLocaleDateString()}</p>
      </div>

      <Input
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="draft">Draft</option>
          <option value="posted">Posted</option>
          <option value="reversed">Reversed</option>
        </select>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Line Items</h4>
        <div className="space-y-2">
          {entry.line_items?.map((line) => (
            <div key={line.id} className="flex justify-between text-sm">
              <span>{line.account_name}: {line.description}</span>
              <span>
                {line.debit_amount > 0 ? `Dr: ${line.debit_amount.toLocaleString('sv-SE')}` : ''}
                {line.credit_amount > 0 ? `Cr: ${line.credit_amount.toLocaleString('sv-SE')}` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Update Entry
        </Button>
      </div>
    </form>
  );
};

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