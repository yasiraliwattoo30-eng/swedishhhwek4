import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { Card } from '../Card';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface TrendData {
  month: string;
  expenses: number;
  income: number;
  investments: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const expenseData: ChartData[] = [
  { name: 'Office Supplies', value: 25000, color: '#3B82F6' },
  { name: 'Travel', value: 15000, color: '#10B981' },
  { name: 'Professional Services', value: 35000, color: '#F59E0B' },
  { name: 'Utilities', value: 8000, color: '#EF4444' },
  { name: 'Marketing', value: 12000, color: '#8B5CF6' },
  { name: 'Other', value: 5000, color: '#06B6D4' }
];

const investmentData: ChartData[] = [
  { name: 'Stocks', value: 450000, color: '#10B981' },
  { name: 'Bonds', value: 300000, color: '#3B82F6' },
  { name: 'Real Estate', value: 200000, color: '#F59E0B' },
  { name: 'Cash', value: 150000, color: '#06B6D4' },
  { name: 'Mutual Funds', value: 100000, color: '#8B5CF6' }
];

const trendData: TrendData[] = [
  { month: 'Jan', expenses: 45000, income: 120000, investments: 50000 },
  { month: 'Feb', expenses: 52000, income: 135000, investments: 75000 },
  { month: 'Mar', expenses: 48000, income: 128000, investments: 60000 },
  { month: 'Apr', expenses: 55000, income: 142000, investments: 80000 },
  { month: 'May', expenses: 49000, income: 138000, investments: 65000 },
  { month: 'Jun', expenses: 53000, income: 145000, investments: 85000 }
];

const foundationPerformanceData = [
  { name: 'Green Future Foundation', expenses: 125000, investments: 850000, projects: 3, status: 'Active' },
  { name: 'Education for All', expenses: 85000, investments: 450000, projects: 2, status: 'Pending' }
];

export const ExpensesPieChart: React.FC = () => {
  return (
    <Card title="Expenses by Category" subtitle="Distribution of foundation spending">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={expenseData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {expenseData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`${value.toLocaleString('sv-SE')} SEK`, 'Amount']} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {expenseData.map((item, index) => (
          <div key={item.name} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
            />
            <span className="text-xs text-gray-600 truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const InvestmentsPieChart: React.FC = () => {
  return (
    <Card title="Investment Portfolio" subtitle="Asset allocation breakdown">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={investmentData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {investmentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`${value.toLocaleString('sv-SE')} SEK`, 'Value']} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {investmentData.map((item, index) => (
          <div key={item.name} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
            />
            <span className="text-xs text-gray-600 truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const FinancialTrendsChart: React.FC = () => {
  return (
    <Card title="Financial Trends" subtitle="Monthly financial overview">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData}>
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
  );
};

export const FoundationPerformanceChart: React.FC = () => {
  return (
    <Card title="Foundation Performance" subtitle="Comparative analysis across foundations">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={foundationPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => [`${value.toLocaleString('sv-SE')} SEK`, '']} />
            <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
            <Bar dataKey="investments" fill="#10B981" name="Investments" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const InvestmentPerformanceChart: React.FC = () => {
  const performanceData = [
    { month: 'Jan', portfolio: 1200000, benchmark: 1180000 },
    { month: 'Feb', portfolio: 1250000, benchmark: 1200000 },
    { month: 'Mar', portfolio: 1180000, benchmark: 1190000 },
    { month: 'Apr', portfolio: 1320000, benchmark: 1220000 },
    { month: 'May', portfolio: 1280000, benchmark: 1240000 },
    { month: 'Jun', portfolio: 1350000, benchmark: 1260000 }
  ];

  return (
    <Card title="Investment Performance" subtitle="Portfolio vs benchmark comparison">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
            <Tooltip formatter={(value: number) => [`${value.toLocaleString('sv-SE')} SEK`, '']} />
            <Area type="monotone" dataKey="portfolio" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Portfolio" />
            <Area type="monotone" dataKey="benchmark" stackId="2" stroke="#6B7280" fill="#6B7280" fillOpacity={0.3} name="Benchmark" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const ComplianceStatusChart: React.FC = () => {
  const complianceData = [
    { name: 'Completed', value: 12, color: '#10B981' },
    { name: 'In Progress', value: 3, color: '#3B82F6' },
    { name: 'Overdue', value: 1, color: '#EF4444' },
    { name: 'Upcoming', value: 5, color: '#F59E0B' }
  ];

  return (
    <Card title="Compliance Status" subtitle="Regulatory requirements overview">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={complianceData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {complianceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {complianceData.map((item) => (
          <div key={item.name} className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const MeetingActivityChart: React.FC = () => {
  const meetingData = [
    { month: 'Jan', scheduled: 4, completed: 4, cancelled: 0 },
    { month: 'Feb', scheduled: 3, completed: 3, cancelled: 0 },
    { month: 'Mar', scheduled: 5, completed: 4, cancelled: 1 },
    { month: 'Apr', scheduled: 3, completed: 2, cancelled: 0 },
    { month: 'May', scheduled: 4, completed: 4, cancelled: 0 },
    { month: 'Jun', scheduled: 6, completed: 5, cancelled: 1 }
  ];

  return (
    <Card title="Meeting Activity" subtitle="Monthly meeting statistics">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={meetingData}>
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
  );
};