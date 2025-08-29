import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { mockFoundations } from '../data/mockData';

export const FoundationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredFoundations = mockFoundations.filter(foundation => {
    const matchesSearch = foundation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         foundation.registration_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || foundation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending_verification':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Foundations</h1>
          <p className="text-gray-600 mt-1">Manage your foundation registrations and documentation.</p>
        </div>
        <Link to="/foundations/new">
          <Button icon={Plus}>
            New Foundation
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search foundations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Foundations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFoundations.map((foundation) => (
          <Card key={foundation.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getStatusIcon(foundation.status)}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{foundation.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{foundation.registration_number}</p>
                  {foundation.description && (
                    <p className="text-sm text-gray-700 mt-2">{foundation.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                    {foundation.address && <span>{foundation.address}</span>}
                    {foundation.phone && <span>{foundation.phone}</span>}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(foundation.status)}`}>
                {foundation.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Created {new Date(foundation.created_at).toLocaleDateString()}
              </p>
              <div className="flex items-center space-x-2">
                <Link to={`/foundations/${foundation.id}`}>
                  <Button variant="ghost" size="sm" icon={Eye}>
                    View
                  </Button>
                </Link>
                <Link to={`/foundations/${foundation.id}/edit`}>
                  <Button variant="ghost" size="sm" icon={Edit}>
                    Edit
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredFoundations.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Filter className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No foundations found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first foundation.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link to="/foundations/new">
                <Button icon={Plus}>
                  Create Foundation
                </Button>
              </Link>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};