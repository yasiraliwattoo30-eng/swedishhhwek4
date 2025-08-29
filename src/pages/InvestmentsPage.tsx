import React, { useState } from 'react';
import { Plus, Search, TrendingUp, TrendingDown, DollarSign, Eye, Edit } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { mockInvestments, mockFoundations } from '../data/mockData';

export const InvestmentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [foundationFilter, setFoundationFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredInvestments = mockInvestments.filter(investment => {
    const matchesSearch = investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investment.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || investment.type === typeFilter;
    const matchesFoundation = foundationFilter === 'all' || investment.foundation_id === foundationFilter;
    return matchesSearch && matchesType && matchesFoundation;
  });

  const getPerformanceIcon = (performance?: number) => {
    if (!performance) return <DollarSign className="w-5 h-5 text-gray-500" />;
    return performance >= 0 
      ? <TrendingUp className="w-5 h-5 text-green-500" />
      : <TrendingDown className="w-5 h-5 text-red-500" />;
  };

  const getPerformanceColor = (performance?: number) => {
    if (!performance) return 'text-gray-600';
    return performance >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const totalValue = filteredInvestments.reduce((sum, investment) => 
    sum + (investment.current_value || investment.amount), 0);
  const totalInvested = filteredInvestments.reduce((sum, investment) => sum + investment.amount, 0);
  const totalGainLoss = totalValue - totalInvested;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investments</h1>
          <p className="text-gray-600 mt-1">Track and manage foundation investments.</p>
        </div>
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
          Add Investment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Invested</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalInvested.toLocaleString('sv-SE')} SEK
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalValue.toLocaleString('sv-SE')} SEK
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                totalGainLoss >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {totalGainLoss >= 0 
                  ? <TrendingUp className="w-5 h-5 text-green-600" />
                  : <TrendingDown className="w-5 h-5 text-red-600" />
                }
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gain/Loss</p>
              <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGainLoss >= 0 ? '+' : ''}{totalGainLoss.toLocaleString('sv-SE')} SEK
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Portfolio Count</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredInvestments.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search investments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="lg:w-48">
            <select
              value={foundationFilter}
              onChange={(e) => setFoundationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Foundations</option>
              {mockFoundations.map((foundation) => (
                <option key={foundation.id} value={foundation.id}>
                  {foundation.name}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:w-48">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="stock">Stock</option>
              <option value="bond">Bond</option>
              <option value="mutual_fund">Mutual Fund</option>
              <option value="real_estate">Real Estate</option>
              <option value="commodity">Commodity</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Investments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInvestments.map((investment) => {
          const foundation = mockFoundations.find(f => f.id === investment.foundation_id);
          const gainLoss = (investment.current_value || investment.amount) - investment.amount;
          return (
            <Card key={investment.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  {getPerformanceIcon(investment.performance)}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{investment.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {getTypeLabel(investment.type)} • {foundation?.name}
                    </p>
                    {investment.notes && (
                      <p className="text-sm text-gray-700 mt-2">{investment.notes}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Invested Amount</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {investment.amount.toLocaleString('sv-SE')} {investment.currency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Value</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {(investment.current_value || investment.amount).toLocaleString('sv-SE')} {investment.currency}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Performance</p>
                  <p className={`text-lg font-semibold ${getPerformanceColor(investment.performance)}`}>
                    {investment.performance ? `${investment.performance > 0 ? '+' : ''}${investment.performance}%` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gain/Loss</p>
                  <p className={`text-lg font-semibold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {gainLoss >= 0 ? '+' : ''}{gainLoss.toLocaleString('sv-SE')} {investment.currency}
                  </p>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                Acquired: {new Date(investment.acquisition_date).toLocaleDateString()}
              </div>
              
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
                <Button variant="ghost" size="sm" icon={Eye}>
                  View Details
                </Button>
                <Button variant="ghost" size="sm" icon={Edit}>
                  Edit
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredInvestments.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No investments found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || typeFilter !== 'all' || foundationFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first investment.'
              }
            </p>
            {!searchTerm && typeFilter === 'all' && foundationFilter === 'all' && (
              <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
                Add Investment
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Create Investment Modal */}
      {/* Investment Performance Chart */}
      <Card title="Investment Performance Over Time" subtitle="Track portfolio growth and market comparison">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { month: 'Jan', portfolio: 1200000, market: 1180000 },
              { month: 'Feb', portfolio: 1250000, market: 1200000 },
              { month: 'Mar', portfolio: 1180000, market: 1190000 },
              { month: 'Apr', portfolio: 1320000, market: 1220000 },
              { month: 'May', portfolio: 1280000, market: 1240000 },
              { month: 'Jun', portfolio: 1350000, market: 1260000 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value: number) => [`${value.toLocaleString('sv-SE')} SEK`, '']} />
              <Area type="monotone" dataKey="portfolio" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Portfolio" />
              <Area type="monotone" dataKey="market" stackId="2" stroke="#6B7280" fill="#6B7280" fillOpacity={0.3} name="Market Index" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Investment"
        size="lg"
      >
        <InvestmentForm onClose={() => setShowCreateModal(false)} />
      </Modal>
    </div>
  );
};

const InvestmentForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    foundation_id: '',
    type: '',
    name: '',
    amount: '',
    currency: 'SEK',
    acquisition_date: '',
    current_value: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onClose();
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Foundation
          </label>
          <select
            name="foundation_id"
            value={formData.foundation_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="">Select Foundation</option>
            {mockFoundations.map((foundation) => (
              <option key={foundation.id} value={foundation.id}>
                {foundation.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Investment Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="">Select Type</option>
            <option value="stock">Stock</option>
            <option value="bond">Bond</option>
            <option value="mutual_fund">Mutual Fund</option>
            <option value="real_estate">Real Estate</option>
            <option value="commodity">Commodity</option>
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <Input
        label="Investment Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g., Apple Inc. Stock, Government Bond"
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Amount Invested"
          name="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="SEK">SEK</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <Input
          label="Current Value (Optional)"
          name="current_value"
          type="number"
          step="0.01"
          value={formData.current_value}
          onChange={handleChange}
          placeholder="0.00"
        />
      </div>

      <Input
        label="Acquisition Date"
        name="acquisition_date"
        type="date"
        value={formData.acquisition_date}
        onChange={handleChange}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Additional notes about this investment"
        />
      </div>
      
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Add Investment
        </Button>
      </div>
    </form>
  );
};