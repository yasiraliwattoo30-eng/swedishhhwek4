import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Download } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { mockFoundations, mockExpenses, mockInvestments, mockProjects } from '../data/mockData';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const ReportsPage: React.FC = () => {
  const [selectedFoundation, setSelectedFoundation] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-12-31'
  });

  const filteredExpenses = mockExpenses.filter(expense => 
    selectedFoundation === 'all' || expense.foundation_id === selectedFoundation
  );

  const filteredInvestments = mockInvestments.filter(investment => 
    selectedFoundation === 'all' || investment.foundation_id === selectedFoundation
  );

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalInvestments = filteredInvestments.reduce((sum, investment) => sum + investment.amount, 0);
  const totalCurrentValue = filteredInvestments.reduce((sum, investment) => 
    sum + (investment.current_value || investment.amount), 0);

  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const investmentsByType = filteredInvestments.reduce((acc, investment) => {
    acc[investment.type] = (acc[investment.type] || 0) + investment.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">View comprehensive reports and analytics for your foundations.</p>
        </div>
        <Button icon={Download}>
          Export Reports
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foundation
            </label>
            <select
              value={selectedFoundation}
              onChange={(e) => setSelectedFoundation(e.target.value)}
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
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
            <Input
              label="End Date"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalExpenses.toLocaleString('sv-SE')} SEK
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Investments</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalInvestments.toLocaleString('sv-SE')} SEK
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
              <p className="text-sm font-medium text-gray-600">Investment Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalCurrentValue.toLocaleString('sv-SE')} SEK
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <PieChart className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Net Gain/Loss</p>
              <p className={`text-2xl font-bold ${totalCurrentValue - totalInvestments >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(totalCurrentValue - totalInvestments >= 0 ? '+' : '')}{(totalCurrentValue - totalInvestments).toLocaleString('sv-SE')} SEK
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        <Card title="Expenses by Category" subtitle="Breakdown of spending categories">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={Object.entries(expensesByCategory).map(([category, amount], index) => ({
                    name: category.replace(/_/g, ' '),
                    value: amount,
                    color: COLORS[index % COLORS.length]
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(expensesByCategory).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toLocaleString('sv-SE')} SEK`, 'Amount']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Investments by Type */}
        <Card title="Investments by Type" subtitle="Portfolio allocation breakdown">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={Object.entries(investmentsByType).map(([type, amount], index) => ({
                    name: type.replace(/_/g, ' '),
                    value: amount,
                    color: COLORS[index % COLORS.length]
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(investmentsByType).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toLocaleString('sv-SE')} SEK`, 'Value']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card title="Monthly Financial Overview" subtitle="Track financial trends over time">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { month: 'Jan', expenses: 45000, income: 120000, investments: 50000 },
              { month: 'Feb', expenses: 52000, income: 135000, investments: 75000 },
              { month: 'Mar', expenses: 48000, income: 128000, investments: 60000 },
              { month: 'Apr', expenses: 55000, income: 142000, investments: 80000 },
              { month: 'May', expenses: 49000, income: 138000, investments: 65000 },
              { month: 'Jun', expenses: 53000, income: 145000, investments: 85000 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => [`${value.toLocaleString('sv-SE')} SEK`, '']} />
              <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />
              <Line type="monotone" dataKey="investments" stroke="#3B82F6" strokeWidth={2} name="Investments" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Foundation Performance Chart */}
      <Card title="Foundation Performance Comparison" subtitle="Compare performance across foundations">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockFoundations.map((foundation) => {
              const foundationExpenses = mockExpenses.filter(e => e.foundation_id === foundation.id);
              const foundationInvestments = mockInvestments.filter(i => i.foundation_id === foundation.id);
              const foundationProjects = mockProjects.filter(p => p.foundation_id === foundation.id);
              
              return {
                name: foundation.name,
                expenses: foundationExpenses.reduce((sum, e) => sum + e.amount, 0),
                investments: foundationInvestments.reduce((sum, i) => sum + i.amount, 0),
                projects: foundationProjects.length
              };
            })}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => [`${value.toLocaleString('sv-SE')} SEK`, '']} />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              <Bar dataKey="investments" fill="#10B981" name="Investments" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Investment Performance Over Time */}
      <Card title="Investment Performance Trends" subtitle="Track investment growth over time">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { month: 'Jan', portfolio: 1200000, benchmark: 1180000 },
              { month: 'Feb', portfolio: 1250000, benchmark: 1200000 },
              { month: 'Mar', portfolio: 1180000, benchmark: 1190000 },
              { month: 'Apr', portfolio: 1320000, benchmark: 1220000 },
              { month: 'May', portfolio: 1280000, benchmark: 1240000 },
              { month: 'Jun', portfolio: 1350000, benchmark: 1260000 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value: number) => [`${value.toLocaleString('sv-SE')} SEK`, '']} />
              <Line type="monotone" dataKey="portfolio" stroke="#10B981" strokeWidth={3} name="Portfolio" />
              <Line type="monotone" dataKey="benchmark" stroke="#6B7280" strokeWidth={2} strokeDasharray="5 5" name="Benchmark" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Project Status Distribution */}
      <Card title="Project Status Distribution" subtitle="Overview of project completion rates">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={[
                  { name: 'Completed', value: mockProjects.filter(p => p.status === 'completed').length, color: '#10B981' },
                  { name: 'In Progress', value: mockProjects.filter(p => p.status === 'in_progress').length, color: '#3B82F6' },
                  { name: 'Planning', value: mockProjects.filter(p => p.status === 'planning').length, color: '#F59E0B' },
                  { name: 'On Hold', value: mockProjects.filter(p => p.status === 'on_hold').length, color: '#EF4444' }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {[
                  { name: 'Completed', value: mockProjects.filter(p => p.status === 'completed').length, color: '#10B981' },
                  { name: 'In Progress', value: mockProjects.filter(p => p.status === 'in_progress').length, color: '#3B82F6' },
                  { name: 'Planning', value: mockProjects.filter(p => p.status === 'planning').length, color: '#F59E0B' },
                  { name: 'On Hold', value: mockProjects.filter(p => p.status === 'on_hold').length, color: '#EF4444' }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Meeting Activity Chart */}
      <Card title="Meeting Activity Trends" subtitle="Monthly meeting statistics">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { month: 'Jan', scheduled: 4, completed: 4, cancelled: 0 },
              { month: 'Feb', scheduled: 3, completed: 3, cancelled: 0 },
              { month: 'Mar', scheduled: 5, completed: 4, cancelled: 1 },
              { month: 'Apr', scheduled: 3, completed: 2, cancelled: 0 },
              { month: 'May', scheduled: 4, completed: 4, cancelled: 0 },
              { month: 'Jun', scheduled: 6, completed: 5, cancelled: 1 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="scheduled" fill="#3B82F6" name="Scheduled" />
              <Bar dataKey="completed" fill="#10B981" name="Completed" />
              <Bar dataKey="cancelled" fill="#EF4444" name="Cancelled" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Expense Trends Over Time */}
      <Card title="Expense Trends Analysis" subtitle="Monthly expense patterns and forecasting">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { month: 'Jan', actual: 45000, budget: 50000, forecast: 47000 },
              { month: 'Feb', actual: 52000, budget: 50000, forecast: 51000 },
              { month: 'Mar', actual: 48000, budget: 50000, forecast: 49000 },
              { month: 'Apr', actual: 55000, budget: 50000, forecast: 53000 },
              { month: 'May', actual: 49000, budget: 50000, forecast: 50000 },
              { month: 'Jun', actual: 53000, budget: 50000, forecast: 52000 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => [`${value.toLocaleString('sv-SE')} SEK`, '']} />
              <Line type="monotone" dataKey="actual" stroke="#EF4444" strokeWidth={2} name="Actual" />
              <Line type="monotone" dataKey="budget" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" name="Budget" />
              <Line type="monotone" dataKey="forecast" stroke="#10B981" strokeWidth={2} name="Forecast" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Foundation Performance */}
      <Card title="Foundation Performance" subtitle="Compare performance across foundations">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Foundation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Expenses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Investments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockFoundations.map((foundation) => {
                const foundationExpenses = mockExpenses.filter(e => e.foundation_id === foundation.id);
                const foundationInvestments = mockInvestments.filter(i => i.foundation_id === foundation.id);
                const foundationProjects = mockProjects.filter(p => p.foundation_id === foundation.id);
                
                return (
                  <tr key={foundation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{foundation.name}</div>
                        <div className="text-sm text-gray-500">{foundation.registration_number}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {foundationExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString('sv-SE')} SEK
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {foundationInvestments.reduce((sum, i) => sum + i.amount, 0).toLocaleString('sv-SE')} SEK
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {foundationProjects.filter(p => p.status === 'in_progress').length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        foundation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {foundation.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};