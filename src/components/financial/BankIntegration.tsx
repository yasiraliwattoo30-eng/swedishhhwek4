import React, { useState } from 'react';
import { Plus, WifiSync as Sync, Eye, CheckCircle, AlertTriangle, CreditCard, Building, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Input } from '../Input';
import { Modal } from '../Modal';

interface BankAccount {
  id: string;
  account_name: string;
  bank_name: string;
  account_number: string;
  iban?: string;
  currency: string;
  account_type: 'checking' | 'savings' | 'business';
  current_balance: number;
  is_primary: boolean;
  is_active: boolean;
  last_sync_at?: string;
}

interface BankTransaction {
  id: string;
  bank_account_id: string;
  transaction_date: string;
  description: string;
  reference_number?: string;
  amount: number;
  transaction_type: 'debit' | 'credit';
  balance_after: number;
  category?: string;
  is_reconciled: boolean;
}

const mockBankAccounts: BankAccount[] = [
  {
    id: '1',
    account_name: 'Foundation Operating Account',
    bank_name: 'Swedbank',
    account_number: '8327-9,123 456 789-0',
    iban: 'SE35 8000 0832 7912 3456 7890',
    currency: 'SEK',
    account_type: 'business',
    current_balance: 1250000,
    is_primary: true,
    is_active: true,
    last_sync_at: '2024-03-20T10:30:00Z'
  },
  {
    id: '2',
    account_name: 'Foundation Savings Account',
    bank_name: 'Handelsbanken',
    account_number: '6000,123 456 789',
    iban: 'SE45 6000 0000 0001 2345 6789',
    currency: 'SEK',
    account_type: 'savings',
    current_balance: 500000,
    is_primary: false,
    is_active: true,
    last_sync_at: '2024-03-20T10:25:00Z'
  }
];

const mockTransactions: BankTransaction[] = [
  {
    id: '1',
    bank_account_id: '1',
    transaction_date: '2024-03-20',
    description: 'Donation from Green Tech Solutions AB',
    reference_number: 'REF-2024-001',
    amount: 50000,
    transaction_type: 'credit',
    balance_after: 1250000,
    category: 'Donations',
    is_reconciled: true
  },
  {
    id: '2',
    bank_account_id: '1',
    transaction_date: '2024-03-19',
    description: 'Office rent payment',
    reference_number: 'RENT-MAR-2024',
    amount: -12000,
    transaction_type: 'debit',
    balance_after: 1200000,
    category: 'Office Expenses',
    is_reconciled: true
  },
  {
    id: '3',
    bank_account_id: '1',
    transaction_date: '2024-03-18',
    description: 'Supplier payment - Office Supplies AB',
    reference_number: 'INV-OS-2024-001',
    amount: -15000,
    transaction_type: 'debit',
    balance_after: 1212000,
    category: 'Office Supplies',
    is_reconciled: false
  },
  {
    id: '4',
    bank_account_id: '2',
    transaction_date: '2024-03-15',
    description: 'Interest payment',
    amount: 1250,
    transaction_type: 'credit',
    balance_after: 500000,
    category: 'Interest Income',
    is_reconciled: true
  }
];

export const BankIntegration: React.FC = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(mockBankAccounts);
  const [transactions, setTransactions] = useState<BankTransaction[]>(mockTransactions);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const filteredTransactions = selectedAccount === 'all' 
    ? transactions 
    : transactions.filter(t => t.bank_account_id === selectedAccount);

  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.current_balance, 0);
  const unreconciledCount = transactions.filter(t => !t.is_reconciled).length;
  const recentCredits = transactions.filter(t => t.transaction_type === 'credit').length;
  const recentDebits = transactions.filter(t => t.transaction_type === 'debit').length;

  const handleSync = async (accountId?: string) => {
    setSyncing(true);
    // Simulate API call to bank
    setTimeout(() => {
      setBankAccounts(prev => prev.map(account => 
        (!accountId || account.id === accountId) 
          ? { ...account, last_sync_at: new Date().toISOString() }
          : account
      ));
      setSyncing(false);
    }, 2000);
  };

  const handleReconcile = (transactionId: string) => {
    setTransactions(prev => prev.map(transaction => 
      transaction.id === transactionId 
        ? { ...transaction, is_reconciled: true }
        : transaction
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bank Integration</h2>
          <p className="text-gray-600 mt-1">Connect and sync with Swedish banks for automated transaction import.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            icon={Sync} 
            variant="secondary"
            loading={syncing}
            onClick={() => handleSync()}
          >
            Sync All
          </Button>
          <Button 
            icon={Plus}
            onClick={() => setShowAddAccountModal(true)}
          >
            Add Bank Account
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalBalance.toLocaleString('sv-SE')} SEK
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unreconciled</p>
              <p className="text-2xl font-bold text-gray-900">{unreconciledCount}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Credits This Month</p>
              <p className="text-2xl font-bold text-gray-900">{recentCredits}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Debits This Month</p>
              <p className="text-2xl font-bold text-gray-900">{recentDebits}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bank Accounts */}
      <Card title="Connected Bank Accounts" subtitle="Manage your bank account connections">
        <div className="space-y-4">
          {bankAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{account.account_name}</h3>
                    {account.is_primary && (
                      <span className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{account.bank_name}</p>
                  <p className="text-xs text-gray-500">
                    {account.account_number} • {account.account_type}
                  </p>
                  {account.last_sync_at && (
                    <p className="text-xs text-gray-500">
                      Last sync: {new Date(account.last_sync_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {account.current_balance.toLocaleString('sv-SE')} {account.currency}
                  </p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    account.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {account.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={Sync}
                    loading={syncing}
                    onClick={() => handleSync(account.id)}
                  >
                    Sync
                  </Button>
                  <Button variant="ghost" size="sm" icon={Eye}>
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Account Filter */}
      <Card>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Account:</label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Accounts</option>
            {bankAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.account_name}
              </option>
            ))}
          </select>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setShowReconcileModal(true)}
          >
            Reconcile Transactions
          </Button>
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card title="Recent Transactions" subtitle="Latest bank transactions and reconciliation status">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.transaction_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      {transaction.description}
                      {transaction.reference_number && (
                        <div className="text-xs text-gray-500">
                          Ref: {transaction.reference_number}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {transaction.category || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`font-medium ${
                      transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'credit' ? '+' : ''}
                      {transaction.amount.toLocaleString('sv-SE')} SEK
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {transaction.balance_after.toLocaleString('sv-SE')} SEK
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {transaction.is_reconciled ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {!transaction.is_reconciled && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleReconcile(transaction.id)}
                      >
                        Reconcile
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Bank Account Modal */}
      <Modal
        isOpen={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
        title="Add Bank Account"
        size="lg"
      >
        <BankAccountForm onClose={() => setShowAddAccountModal(false)} />
      </Modal>

      {/* Reconcile Modal */}
      <Modal
        isOpen={showReconcileModal}
        onClose={() => setShowReconcileModal(false)}
        title="Reconcile Transactions"
        size="lg"
      >
        <ReconcileForm 
          transactions={transactions.filter(t => !t.is_reconciled)}
          onReconcile={handleReconcile}
          onClose={() => setShowReconcileModal(false)} 
        />
      </Modal>
    </div>
  );
};

const BankAccountForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    account_name: '',
    bank_name: '',
    account_number: '',
    iban: '',
    account_type: 'business',
    currency: 'SEK'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <Building className="w-12 h-12 text-primary-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Connect Bank Account</h3>
        <p className="text-sm text-gray-600">Add a Swedish bank account for automated transaction sync</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Account Name"
          value={formData.account_name}
          onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
          placeholder="e.g., Foundation Operating Account"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bank Name
          </label>
          <select
            value={formData.bank_name}
            onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="">Select Bank</option>
            <option value="Swedbank">Swedbank</option>
            <option value="Handelsbanken">Handelsbanken</option>
            <option value="SEB">SEB</option>
            <option value="Nordea">Nordea</option>
            <option value="Danske Bank">Danske Bank</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Account Number"
          value={formData.account_number}
          onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
          placeholder="e.g., 8327-9,123 456 789-0"
          required
        />

        <Input
          label="IBAN (Optional)"
          value={formData.iban}
          onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
          placeholder="SE35 8000 0832 7912 3456 7890"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Type
          </label>
          <select
            value={formData.account_type}
            onChange={(e) => setFormData(prev => ({ ...prev, account_type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="business">Business Account</option>
            <option value="checking">Checking Account</option>
            <option value="savings">Savings Account</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="SEK">Swedish Krona (SEK)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="USD">US Dollar (USD)</option>
          </select>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Bank Integration Features:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Automatic transaction import via Open Banking APIs</li>
          <li>• Real-time balance updates</li>
          <li>• Secure connection using BankID authentication</li>
          <li>• Automatic categorization of transactions</li>
          <li>• Reconciliation with accounting records</li>
        </ul>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Connect Account
        </Button>
      </div>
    </form>
  );
};

const ReconcileForm: React.FC<{
  transactions: BankTransaction[];
  onReconcile: (transactionId: string) => void;
  onClose: () => void;
}> = ({ transactions, onReconcile, onClose }) => {
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);

  const handleSelectAll = () => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(transactions.map(t => t.id));
    }
  };

  const handleReconcileSelected = () => {
    selectedTransactions.forEach(id => onReconcile(id));
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Reconcile Transactions</h3>
        <p className="text-sm text-gray-600">Mark transactions as reconciled with your accounting records</p>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">All transactions are already reconciled!</p>
          <Button onClick={onClose} className="mt-4">Close</Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedTransactions.length === transactions.length}
                onChange={handleSelectAll}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Select All ({transactions.length} transactions)
              </span>
            </label>
            <Button 
              disabled={selectedTransactions.length === 0}
              onClick={handleReconcileSelected}
            >
              Reconcile Selected ({selectedTransactions.length})
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.includes(transaction.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTransactions(prev => [...prev, transaction.id]);
                      } else {
                        setSelectedTransactions(prev => prev.filter(id => id !== transaction.id));
                      }
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <span className={`font-medium ${
                        transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.transaction_type === 'credit' ? '+' : ''}
                        {transaction.amount.toLocaleString('sv-SE')} SEK
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                      {transaction.reference_number && ` • Ref: ${transaction.reference_number}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              disabled={selectedTransactions.length === 0}
              onClick={handleReconcileSelected}
            >
              Reconcile Selected
            </Button>
          </div>
        </>
      )}
    </div>
  );
};