import React, { useState } from 'react';
import { Plus, Search, Users, Calculator, Download, Eye, Edit, CheckCircle, Clock } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Input } from '../Input';
import { Modal } from '../Modal';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'approved':
      return 'bg-blue-100 text-blue-800';
    case 'calculated':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface Employee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  department?: string;
  hire_date: string;
  employment_type: 'full_time' | 'part_time' | 'contractor' | 'intern';
  salary_type: 'monthly' | 'hourly';
  base_salary: number;
  currency: string;
  is_active: boolean;
}

interface PayrollRun {
  id: string;
  payroll_period_start: string;
  payroll_period_end: string;
  pay_date: string;
  status: 'draft' | 'calculated' | 'approved' | 'paid' | 'cancelled';
  total_gross_pay: number;
  total_deductions: number;
  total_net_pay: number;
  currency: string;
  employee_count: number;
  created_at: string;
}

interface PayrollEntry {
  id: string;
  employee_name: string;
  gross_pay: number;
  tax_deduction: number;
  social_security_deduction: number;
  other_deductions: number;
  total_deductions: number;
  net_pay: number;
  hours_worked?: number;
  overtime_hours?: number;
  bonus_amount?: number;
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    employee_number: 'EMP-001',
    first_name: 'Anna',
    last_name: 'Andersson',
    email: 'anna.andersson@foundation.se',
    position: 'Program Manager',
    department: 'Operations',
    hire_date: '2023-01-15',
    employment_type: 'full_time',
    salary_type: 'monthly',
    base_salary: 45000,
    currency: 'SEK',
    is_active: true
  },
  {
    id: '2',
    employee_number: 'EMP-002',
    first_name: 'Erik',
    last_name: 'Eriksson',
    email: 'erik.eriksson@foundation.se',
    position: 'Financial Analyst',
    department: 'Finance',
    hire_date: '2023-03-01',
    employment_type: 'full_time',
    salary_type: 'monthly',
    base_salary: 42000,
    currency: 'SEK',
    is_active: true
  },
  {
    id: '3',
    employee_number: 'EMP-003',
    first_name: 'Maria',
    last_name: 'Johansson',
    email: 'maria.johansson@foundation.se',
    position: 'Administrative Assistant',
    department: 'Administration',
    hire_date: '2023-06-01',
    employment_type: 'part_time',
    salary_type: 'hourly',
    base_salary: 250,
    currency: 'SEK',
    is_active: true
  }
];

const mockPayrollRuns: PayrollRun[] = [
  {
    id: '1',
    payroll_period_start: '2024-03-01',
    payroll_period_end: '2024-03-31',
    pay_date: '2024-04-05',
    status: 'paid',
    total_gross_pay: 129000,
    total_deductions: 38700,
    total_net_pay: 90300,
    currency: 'SEK',
    employee_count: 3,
    created_at: '2024-03-25T10:00:00Z'
  },
  {
    id: '2',
    payroll_period_start: '2024-04-01',
    payroll_period_end: '2024-04-30',
    pay_date: '2024-05-05',
    status: 'calculated',
    total_gross_pay: 132000,
    total_deductions: 39600,
    total_net_pay: 92400,
    currency: 'SEK',
    employee_count: 3,
    created_at: '2024-04-25T10:00:00Z'
  }
];

export const PayrollModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'payroll'>('employees');
  const [employees] = useState<Employee[]>(mockEmployees);
  const [payrollRuns] = useState<PayrollRun[]>(mockPayrollRuns);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRun | null>(null);

  const filteredEmployees = employees.filter(employee =>
    `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employee_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEmploymentTypeLabel = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const totalActiveEmployees = employees.filter(emp => emp.is_active).length;
  const totalMonthlySalaries = employees
    .filter(emp => emp.is_active && emp.salary_type === 'monthly')
    .reduce((sum, emp) => sum + emp.base_salary, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payroll Management</h2>
          <p className="text-gray-600 mt-1">Manage employees and process payroll runs.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            icon={Calculator} 
            variant="secondary"
            onClick={() => setShowPayrollModal(true)}
          >
            Run Payroll
          </Button>
          <Button 
            icon={Plus}
            onClick={() => setShowEmployeeModal(true)}
          >
            Add Employee
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Employees</p>
              <p className="text-2xl font-bold text-gray-900">{totalActiveEmployees}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Salaries</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalMonthlySalaries.toLocaleString('sv-SE')} SEK
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
              <p className="text-sm font-medium text-gray-600">Pending Payroll</p>
              <p className="text-2xl font-bold text-gray-900">
                {payrollRuns.filter(pr => pr.status === 'calculated').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Payroll</p>
              <p className="text-2xl font-bold text-gray-900">
                {payrollRuns[0]?.total_net_pay.toLocaleString('sv-SE')} SEK
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('employees')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'employees'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Employees
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payroll'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Payroll Runs
          </button>
        </nav>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={Search}
        />
      </Card>

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <Card title="Employees" subtitle="Manage employee information and salaries">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary
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
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {employee.first_name} {employee.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.employee_number} • {employee.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.position}</div>
                      {employee.department && (
                        <div className="text-sm text-gray-500">{employee.department}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getEmploymentTypeLabel(employee.employment_type)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Since {new Date(employee.hire_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.base_salary.toLocaleString('sv-SE')} {employee.currency}
                      <div className="text-xs text-gray-500">
                        {employee.salary_type === 'monthly' ? 'per month' : 'per hour'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" icon={Eye}>
                          View
                        </Button>
                        <Button variant="ghost" size="sm" icon={Edit}>
                          Edit
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

      {/* Payroll Runs Tab */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          {payrollRuns.map((payroll) => (
            <Card key={payroll.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {getStatusIcon(payroll.status)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Payroll {new Date(payroll.payroll_period_start).toLocaleDateString()} - {new Date(payroll.payroll_period_end).toLocaleDateString()}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Pay Date:</span>
                        <br />
                        <span className="text-gray-900">{new Date(payroll.pay_date).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Employees:</span>
                        <br />
                        <span className="text-gray-900">{payroll.employee_count}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Gross Pay:</span>
                        <br />
                        <span className="text-gray-900">{payroll.total_gross_pay.toLocaleString('sv-SE')} {payroll.currency}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Net Pay:</span>
                        <br />
                        <span className="text-lg font-semibold text-gray-900">
                          {payroll.total_net_pay.toLocaleString('sv-SE')} {payroll.currency}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      Total Deductions: {payroll.total_deductions.toLocaleString('sv-SE')} {payroll.currency}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payroll.status)}`}>
                    {payroll.status.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      icon={Eye}
                      onClick={() => setSelectedPayroll(payroll)}
                    >
                      View Details
                    </Button>
                    <Button variant="ghost" size="sm" icon={Download}>
                      Export
                    </Button>
                    {payroll.status === 'calculated' && (
                      <Button size="sm">
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Employee Modal */}
      <Modal
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        title="Add Employee"
        size="lg"
      >
        <EmployeeForm onClose={() => setShowEmployeeModal(false)} />
      </Modal>

      {/* Run Payroll Modal */}
      <Modal
        isOpen={showPayrollModal}
        onClose={() => setShowPayrollModal(false)}
        title="Run Payroll"
        size="md"
      >
        <PayrollRunForm onClose={() => setShowPayrollModal(false)} />
      </Modal>

      {/* Payroll Details Modal */}
      <Modal
        isOpen={!!selectedPayroll}
        onClose={() => setSelectedPayroll(null)}
        title="Payroll Details"
        size="lg"
      >
        {selectedPayroll && <PayrollDetails payroll={selectedPayroll} />}
      </Modal>
    </div>
  );
};

const EmployeeForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    position: '',
    department: '',
    hire_date: '',
    employment_type: 'full_time',
    salary_type: 'monthly',
    base_salary: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          value={formData.first_name}
          onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
          required
        />
        <Input
          label="Last Name"
          value={formData.last_name}
          onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
          required
        />
      </div>

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Position"
          value={formData.position}
          onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
          required
        />
        <Input
          label="Department"
          value={formData.department}
          onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Hire Date"
          type="date"
          value={formData.hire_date}
          onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employment Type
          </label>
          <select
            value={formData.employment_type}
            onChange={(e) => setFormData(prev => ({ ...prev, employment_type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contractor">Contractor</option>
            <option value="intern">Intern</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Salary Type
          </label>
          <select
            value={formData.salary_type}
            onChange={(e) => setFormData(prev => ({ ...prev, salary_type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="monthly">Monthly</option>
            <option value="hourly">Hourly</option>
          </select>
        </div>
      </div>

      <Input
        label={`Base Salary (${formData.salary_type === 'monthly' ? 'per month' : 'per hour'})`}
        type="number"
        step="0.01"
        value={formData.base_salary}
        onChange={(e) => setFormData(prev => ({ ...prev, base_salary: e.target.value }))}
        required
      />

      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Add Employee
        </Button>
      </div>
    </form>
  );
};

const PayrollRunForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    payroll_period_start: '',
    payroll_period_end: '',
    pay_date: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <Calculator className="w-12 h-12 text-primary-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Run Payroll</h3>
        <p className="text-sm text-gray-600">Calculate payroll for all active employees</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Payroll Period Start"
          type="date"
          value={formData.payroll_period_start}
          onChange={(e) => setFormData(prev => ({ ...prev, payroll_period_start: e.target.value }))}
          required
        />
        <Input
          label="Payroll Period End"
          type="date"
          value={formData.payroll_period_end}
          onChange={(e) => setFormData(prev => ({ ...prev, payroll_period_end: e.target.value }))}
          required
        />
      </div>

      <Input
        label="Pay Date"
        type="date"
        value={formData.pay_date}
        onChange={(e) => setFormData(prev => ({ ...prev, pay_date: e.target.value }))}
        required
      />

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Payroll Calculation Includes:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Base salary calculations</li>
          <li>• Swedish tax deductions (preliminary tax)</li>
          <li>• Social security contributions</li>
          <li>• Pension contributions</li>
          <li>• Holiday pay calculations</li>
        </ul>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" icon={Calculator}>
          Calculate Payroll
        </Button>
      </div>
    </form>
  );
};

const PayrollDetails: React.FC<{ payroll: PayrollRun }> = ({ payroll }) => {
  const mockPayrollEntries: PayrollEntry[] = [
    {
      id: '1',
      employee_name: 'Anna Andersson',
      gross_pay: 45000,
      tax_deduction: 13500,
      social_security_deduction: 2250,
      other_deductions: 0,
      total_deductions: 15750,
      net_pay: 29250,
      hours_worked: 160
    },
    {
      id: '2',
      employee_name: 'Erik Eriksson',
      gross_pay: 42000,
      tax_deduction: 12600,
      social_security_deduction: 2100,
      other_deductions: 0,
      total_deductions: 14700,
      net_pay: 27300,
      hours_worked: 160
    },
    {
      id: '3',
      employee_name: 'Maria Johansson',
      gross_pay: 20000,
      tax_deduction: 6000,
      social_security_deduction: 1000,
      other_deductions: 0,
      total_deductions: 7000,
      net_pay: 13000,
      hours_worked: 80
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Payroll Period: {new Date(payroll.payroll_period_start).toLocaleDateString()} - {new Date(payroll.payroll_period_end).toLocaleDateString()}
          </h3>
          <p className="text-sm text-gray-600">Pay Date: {new Date(payroll.pay_date).toLocaleDateString()}</p>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(payroll.status)}`}>
          {payroll.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Gross Pay</h4>
          <p className="text-2xl font-bold text-gray-900">
            {payroll.total_gross_pay.toLocaleString('sv-SE')} {payroll.currency}
          </p>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Total Deductions</h4>
          <p className="text-2xl font-bold text-red-600">
            -{payroll.total_deductions.toLocaleString('sv-SE')} {payroll.currency}
          </p>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Net Pay</h4>
          <p className="text-2xl font-bold text-green-600">
            {payroll.total_net_pay.toLocaleString('sv-SE')} {payroll.currency}
          </p>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Employee Breakdown</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Employee
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Hours
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Gross Pay
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Tax
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Social Security
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Net Pay
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockPayrollEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">
                    {entry.employee_name}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                    {entry.hours_worked}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                    {entry.gross_pay.toLocaleString('sv-SE')}
                  </td>
                  <td className="px-4 py-2 text-sm text-red-600 text-right">
                    -{entry.tax_deduction.toLocaleString('sv-SE')}
                  </td>
                  <td className="px-4 py-2 text-sm text-red-600 text-right">
                    -{entry.social_security_deduction.toLocaleString('sv-SE')}
                  </td>
                  <td className="px-4 py-2 text-sm font-semibold text-green-600 text-right">
                    {entry.net_pay.toLocaleString('sv-SE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};