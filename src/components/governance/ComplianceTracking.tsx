import React, { useState } from 'react';
import { AlertTriangle, Calendar, CheckCircle, Clock, Plus, Filter } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Input } from '../Input';
import { Modal } from '../Modal';

interface ComplianceItem {
  id: string;
  foundation_name: string;
  regulation_type: 'lansstyrelsen' | 'skatteverket' | 'bolagsverket' | 'other';
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to: string;
  documents_required: string[];
  created_at: string;
  updated_at: string;
}

const mockComplianceItems: ComplianceItem[] = [
  {
    id: '1',
    foundation_name: 'Green Future Foundation',
    regulation_type: 'lansstyrelsen',
    title: 'Annual Activity Report Submission',
    description: 'Submit annual report detailing foundation activities and financial status to Länsstyrelsen',
    due_date: '2024-04-30',
    status: 'in_progress',
    priority: 'high',
    assigned_to: 'John Secretary',
    documents_required: ['Annual Report', 'Financial Statement', 'Board Resolution'],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-03-20T14:30:00Z'
  },
  {
    id: '2',
    foundation_name: 'Green Future Foundation',
    regulation_type: 'skatteverket',
    title: 'Tax Return Filing',
    description: 'File annual tax return and supporting documentation',
    due_date: '2024-05-31',
    status: 'pending',
    priority: 'critical',
    assigned_to: 'External Accountant',
    documents_required: ['Tax Return Form', 'Income Statement', 'Expense Records'],
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-02-01T09:00:00Z'
  },
  {
    id: '3',
    foundation_name: 'Education for All Foundation',
    regulation_type: 'bolagsverket',
    title: 'Board Member Registration Update',
    description: 'Update board member information in company registry',
    due_date: '2024-03-15',
    status: 'overdue',
    priority: 'medium',
    assigned_to: 'Jane Chairman',
    documents_required: ['Board Resolution', 'ID Documents'],
    created_at: '2024-01-10T11:00:00Z',
    updated_at: '2024-03-10T16:00:00Z'
  },
  {
    id: '4',
    foundation_name: 'Green Future Foundation',
    regulation_type: 'lansstyrelsen',
    title: 'Permit Renewal Application',
    description: 'Renew foundation operating permit',
    due_date: '2024-12-31',
    status: 'completed',
    priority: 'medium',
    assigned_to: 'Legal Advisor',
    documents_required: ['Application Form', 'Current Permit', 'Compliance Certificate'],
    created_at: '2023-10-01T08:00:00Z',
    updated_at: '2024-02-15T12:00:00Z'
  }
];

export const ComplianceTracking: React.FC = () => {
  const [complianceItems] = useState<ComplianceItem[]>(mockComplianceItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regulationFilter, setRegulationFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredItems = complianceItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesRegulation = regulationFilter === 'all' || item.regulation_type === regulationFilter;
    return matchesSearch && matchesStatus && matchesRegulation;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Calendar className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRegulationLabel = (type: string) => {
    switch (type) {
      case 'lansstyrelsen':
        return 'Länsstyrelsen';
      case 'skatteverket':
        return 'Skatteverket';
      case 'bolagsverket':
        return 'Bolagsverket';
      default:
        return 'Other';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const upcomingDeadlines = filteredItems
    .filter(item => item.status !== 'completed')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Compliance Tracking</h2>
          <p className="text-gray-600 mt-1">Monitor regulatory requirements and deadlines.</p>
        </div>
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
          Add Compliance Item
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredItems.filter(item => item.status === 'overdue').length}
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
              <p className="text-sm font-medium text-gray-600">Due This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredItems.filter(item => {
                  const daysUntil = getDaysUntilDue(item.due_date);
                  return daysUntil <= 30 && daysUntil >= 0 && item.status !== 'completed';
                }).length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredItems.filter(item => item.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredItems.filter(item => item.status === 'completed').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card title="Upcoming Deadlines" subtitle="Items requiring immediate attention">
        <div className="space-y-3">
          {upcomingDeadlines.map((item) => {
            const daysUntil = getDaysUntilDue(item.due_date);
            return (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600">{getRegulationLabel(item.regulation_type)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    daysUntil < 0 ? 'text-red-600' : 
                    daysUntil <= 7 ? 'text-orange-600' : 
                    'text-gray-900'
                  }`}>
                    {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` :
                     daysUntil === 0 ? 'Due today' :
                     `${daysUntil} days remaining`}
                  </p>
                  <p className="text-xs text-gray-500">{new Date(item.due_date).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search compliance items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Filter}
            />
          </div>
          <div className="lg:w-48">
            <select
              value={regulationFilter}
              onChange={(e) => setRegulationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Regulations</option>
              <option value="lansstyrelsen">Länsstyrelsen</option>
              <option value="skatteverket">Skatteverket</option>
              <option value="bolagsverket">Bolagsverket</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Compliance Items List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredItems.map((item) => {
          const daysUntil = getDaysUntilDue(item.due_date);
          return (
            <Card key={item.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {getStatusIcon(item.status)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{getRegulationLabel(item.regulation_type)}</span>
                      <span>•</span>
                      <span>{item.foundation_name}</span>
                      <span>•</span>
                      <span>Assigned to: {item.assigned_to}</span>
                    </div>
                    
                    {item.documents_required.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Required Documents:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.documents_required.map((doc, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                  <p className={`text-sm font-medium mt-2 ${
                    daysUntil < 0 ? 'text-red-600' : 
                    daysUntil <= 7 ? 'text-orange-600' : 
                    'text-gray-900'
                  }`}>
                    {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` :
                     daysUntil === 0 ? 'Due today' :
                     item.status === 'completed' ? 'Completed' :
                     `${daysUntil} days remaining`}
                  </p>
                  <p className="text-xs text-gray-500">{new Date(item.due_date).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Compliance Item Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Compliance Item"
        size="lg"
      >
        <ComplianceForm onClose={() => setShowCreateModal(false)} />
      </Modal>
    </div>
  );
};

const ComplianceForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    regulation_type: '',
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    assigned_to: '',
    documents_required: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Regulation Type
          </label>
          <select
            value={formData.regulation_type}
            onChange={(e) => setFormData(prev => ({ ...prev, regulation_type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="">Select Type</option>
            <option value="lansstyrelsen">Länsstyrelsen</option>
            <option value="skatteverket">Skatteverket</option>
            <option value="bolagsverket">Bolagsverket</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <Input
        label="Title"
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        placeholder="e.g., Annual Activity Report Submission"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Describe the compliance requirement"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Due Date"
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
          required
        />

        <Input
          label="Assigned To"
          value={formData.assigned_to}
          onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
          placeholder="Person responsible"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Required Documents (comma-separated)
        </label>
        <textarea
          value={formData.documents_required}
          onChange={(e) => setFormData(prev => ({ ...prev, documents_required: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g., Annual Report, Financial Statement, Board Resolution"
        />
      </div>

      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Add Compliance Item
        </Button>
      </div>
    </form>
  );
};