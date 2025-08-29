import React, { useState } from 'react';
import { Plus, Search, Calendar, Clock, MapPin, Users, Eye, Edit } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { mockMeetings, mockFoundations } from '../data/mockData';

export const MeetingsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [foundationFilter, setFoundationFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredMeetings = mockMeetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
    const matchesFoundation = foundationFilter === 'all' || meeting.foundation_id === foundationFilter;
    return matchesSearch && matchesStatus && matchesFoundation;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMeetingTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600 mt-1">Schedule and manage foundation meetings.</p>
        </div>
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
          Schedule Meeting
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search meetings..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Meetings List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMeetings.map((meeting) => {
          const foundation = mockFoundations.find(f => f.id === meeting.foundation_id);
          return (
            <Card key={meeting.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{foundation?.name}</p>
                  {meeting.description && (
                    <p className="text-sm text-gray-700 mt-2">{meeting.description}</p>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(meeting.status)}`}>
                  {meeting.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{new Date(meeting.start_time).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>
                    {new Date(meeting.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(meeting.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {meeting.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{meeting.location}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{meeting.attendees.length} attendees</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2 text-xs">📋</span>
                  <span>{getMeetingTypeLabel(meeting.meeting_type)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
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

      {filteredMeetings.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || foundationFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by scheduling your first meeting.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && foundationFilter === 'all' && (
              <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
                Schedule Meeting
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Meeting Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <Card title="Attendance Patterns" subtitle="Meeting attendance over time">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { month: 'Jan', attendance: 85, target: 90 },
                { month: 'Feb', attendance: 92, target: 90 },
                { month: 'Mar', attendance: 78, target: 90 },
                { month: 'Apr', attendance: 88, target: 90 },
                { month: 'May', attendance: 95, target: 90 },
                { month: 'Jun', attendance: 87, target: 90 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value: number) => [`${value}%`, '']} />
                <Line type="monotone" dataKey="attendance" stroke="#10B981" strokeWidth={2} name="Attendance %" />
                <Line type="monotone" dataKey="target" stroke="#6B7280" strokeWidth={2} strokeDasharray="5 5" name="Target %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Create Meeting Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Schedule Meeting"
        size="lg"
      >
        <MeetingForm onClose={() => setShowCreateModal(false)} />
      </Modal>
    </div>
  );
};

const MeetingForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    foundation_id: '',
    title: '',
    description: '',
    start_date: '',
    start_time: '',
    end_time: '',
    location: '',
    meeting_type: 'board_meeting'
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

      <Input
        label="Meeting Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter meeting title"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Meeting agenda and description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Date"
          name="start_date"
          type="date"
          value={formData.start_date}
          onChange={handleChange}
          required
        />
        <Input
          label="Start Time"
          name="start_time"
          type="time"
          value={formData.start_time}
          onChange={handleChange}
          required
        />
        <Input
          label="End Time"
          name="end_time"
          type="time"
          value={formData.end_time}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Meeting location or video link"
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meeting Type
          </label>
          <select
            name="meeting_type"
            value={formData.meeting_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="board_meeting">Board Meeting</option>
            <option value="general_assembly">General Assembly</option>
            <option value="committee_meeting">Committee Meeting</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Schedule Meeting
        </Button>
      </div>
    </form>
  );
};