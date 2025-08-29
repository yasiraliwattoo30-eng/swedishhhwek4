import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Users, FileText, Calendar, DollarSign } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { mockFoundations, mockDocuments, mockMeetings, mockExpenses } from '../data/mockData';

export const FoundationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const foundation = mockFoundations.find(f => f.id === id);

  if (!foundation) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Foundation not found</h2>
        <Link to="/foundations">
          <Button className="mt-4">Back to Foundations</Button>
        </Link>
      </div>
    );
  }

  const foundationDocuments = mockDocuments.filter(d => d.foundation_id === foundation.id);
  const foundationMeetings = mockMeetings.filter(m => m.foundation_id === foundation.id);
  const foundationExpenses = mockExpenses.filter(e => e.foundation_id === foundation.id);

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
      <div className="flex items-center space-x-4">
        <Link to="/foundations">
          <Button variant="ghost" icon={ArrowLeft}>
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{foundation.name}</h1>
          <p className="text-gray-600 mt-1">{foundation.registration_number}</p>
        </div>
        <Link to={`/foundations/${foundation.id}/edit`}>
          <Button icon={Edit}>
            Edit Foundation
          </Button>
        </Link>
      </div>

      {/* Foundation Overview */}
      <Card title="Foundation Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-600">Status</dt>
                <dd>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(foundation.status)}`}>
                    {foundation.status.replace('_', ' ')}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Registration Number</dt>
                <dd className="text-sm text-gray-900">{foundation.registration_number}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Created</dt>
                <dd className="text-sm text-gray-900">{new Date(foundation.created_at).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
            <dl className="space-y-2">
              {foundation.address && (
                <div>
                  <dt className="text-sm text-gray-600">Address</dt>
                  <dd className="text-sm text-gray-900">{foundation.address}</dd>
                </div>
              )}
              {foundation.phone && (
                <div>
                  <dt className="text-sm text-gray-600">Phone</dt>
                  <dd className="text-sm text-gray-900">{foundation.phone}</dd>
                </div>
              )}
              {foundation.website && (
                <div>
                  <dt className="text-sm text-gray-600">Website</dt>
                  <dd className="text-sm text-gray-900">
                    <a href={foundation.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                      {foundation.website}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
        
        {foundation.description && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-700">{foundation.description}</p>
          </div>
        )}
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Documents</p>
              <p className="text-xl font-bold text-gray-900">{foundationDocuments.length}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Meetings</p>
              <p className="text-xl font-bold text-gray-900">{foundationMeetings.length}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Expenses</p>
              <p className="text-xl font-bold text-gray-900">{foundationExpenses.length}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Members</p>
              <p className="text-xl font-bold text-gray-900">5</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to={`/documents?foundation=${foundation.id}`}>
            <Button variant="secondary" className="w-full" icon={FileText}>
              View Documents
            </Button>
          </Link>
          <Link to={`/meetings?foundation=${foundation.id}`}>
            <Button variant="secondary" className="w-full" icon={Calendar}>
              View Meetings
            </Button>
          </Link>
          <Link to={`/expenses?foundation=${foundation.id}`}>
            <Button variant="secondary" className="w-full" icon={DollarSign}>
              View Expenses
            </Button>
          </Link>
          <Link to={`/foundations/${foundation.id}/members`}>
            <Button variant="secondary" className="w-full" icon={Users}>
              Manage Members
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};