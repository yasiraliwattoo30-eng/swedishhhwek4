import React, { useState } from 'react';
import { User, Mail, Edit, Save, X } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { mockUser } from '../data/mockData';

export const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: mockUser.full_name,
    email: mockUser.email,
    avatar_url: mockUser.avatar_url || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsEditing(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCancel = () => {
    setFormData({
      full_name: mockUser.full_name,
      email: mockUser.email,
      avatar_url: mockUser.avatar_url || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information and preferences.</p>
        </div>
        {!isEditing && (
          <Button icon={Edit} onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card title="Personal Information">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  icon={User}
                  required
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  icon={Mail}
                  required
                />

                <Input
                  label="Avatar URL"
                  name="avatar_url"
                  value={formData.avatar_url}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                />

                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Button type="button" variant="secondary" onClick={handleCancel} icon={X}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading} icon={Save}>
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={mockUser.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
                    alt={mockUser.full_name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{mockUser.full_name}</h3>
                    <p className="text-gray-600">{mockUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{mockUser.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <p className="mt-1 text-sm text-gray-900">{mockUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Member Since</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(mockUser.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Status</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Account Statistics */}
        <div className="space-y-6">
          <Card title="Account Statistics">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Foundations</span>
                <span className="text-sm font-medium text-gray-900">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Documents Uploaded</span>
                <span className="text-sm font-medium text-gray-900">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Meetings Organized</span>
                <span className="text-sm font-medium text-gray-900">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Expenses Submitted</span>
                <span className="text-sm font-medium text-gray-900">24</span>
              </div>
            </div>
          </Card>

          <Card title="Security">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-600">Add an extra layer of security</p>
                </div>
                <Button size="sm" variant="secondary">
                  Enable
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">BankID Integration</p>
                  <p className="text-xs text-gray-600">Verify identity with BankID</p>
                </div>
                <Button size="sm" variant="secondary">
                  Setup
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Change Password</p>
                  <p className="text-xs text-gray-600">Update your password</p>
                </div>
                <Button size="sm" variant="secondary">
                  Change
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};