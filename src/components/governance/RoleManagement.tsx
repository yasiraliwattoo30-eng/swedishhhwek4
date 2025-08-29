import React, { useState } from 'react';
import { Shield, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { Input } from '../Input';

interface Role {
  id: string;
  name: string;
  permissions: string[];
  description: string;
  user_count: number;
}

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Board Chairman',
    permissions: ['approve_documents', 'schedule_meetings', 'manage_users', 'view_all_data'],
    description: 'Full governance authority with approval rights',
    user_count: 1
  },
  {
    id: '2',
    name: 'Board Member',
    permissions: ['review_documents', 'attend_meetings', 'view_foundation_data'],
    description: 'Standard board member with review and voting rights',
    user_count: 5
  },
  {
    id: '3',
    name: 'Secretary',
    permissions: ['create_minutes', 'manage_documents', 'schedule_meetings'],
    description: 'Administrative role for meeting and document management',
    user_count: 1
  },
  {
    id: '4',
    name: 'Auditor',
    permissions: ['view_audit_trails', 'review_compliance', 'generate_reports'],
    description: 'External auditor with read-only access to compliance data',
    user_count: 2
  }
];

const availablePermissions = [
  'approve_documents',
  'review_documents',
  'create_documents',
  'schedule_meetings',
  'attend_meetings',
  'create_minutes',
  'approve_minutes',
  'manage_users',
  'view_all_data',
  'view_foundation_data',
  'view_audit_trails',
  'review_compliance',
  'generate_reports',
  'manage_investments',
  'approve_expenses'
];

export const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const handleCreateRole = (roleData: Partial<Role>) => {
    const newRole: Role = {
      id: Date.now().toString(),
      name: roleData.name || '',
      permissions: roleData.permissions || [],
      description: roleData.description || '',
      user_count: 0
    };
    setRoles([...roles, newRole]);
    setShowCreateModal(false);
  };

  const handleEditRole = (roleData: Partial<Role>) => {
    if (editingRole) {
      setRoles(roles.map(role => 
        role.id === editingRole.id 
          ? { ...role, ...roleData }
          : role
      ));
      setEditingRole(null);
    }
  };

  const handleDeleteRole = (roleId: string) => {
    setRoles(roles.filter(role => role.id !== roleId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
          <p className="text-gray-600 mt-1">Define and manage governance roles and permissions.</p>
        </div>
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
          Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {role.user_count} users
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  icon={Edit}
                  onClick={() => setEditingRole(role)}
                >
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  icon={Trash2}
                  onClick={() => handleDeleteRole(role.id)}
                >
                </Button>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-4">{role.description}</p>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Permissions:</h4>
              <div className="flex flex-wrap gap-1">
                {role.permissions.map((permission) => (
                  <span 
                    key={permission}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    {permission.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Role Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Role"
        size="lg"
      >
        <RoleForm 
          onSubmit={handleCreateRole}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={!!editingRole}
        onClose={() => setEditingRole(null)}
        title="Edit Role"
        size="lg"
      >
        {editingRole && (
          <RoleForm 
            role={editingRole}
            onSubmit={handleEditRole}
            onCancel={() => setEditingRole(null)}
          />
        )}
      </Modal>
    </div>
  );
};

interface RoleFormProps {
  role?: Role;
  onSubmit: (data: Partial<Role>) => void;
  onCancel: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ role, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    permissions: role?.permissions || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handlePermissionToggle = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Role Name"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        placeholder="e.g., Board Chairman"
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
          placeholder="Describe the role's responsibilities"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Permissions
        </label>
        <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
          {availablePermissions.map((permission) => (
            <label key={permission} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.permissions.includes(permission)}
                onChange={() => handlePermissionToggle(permission)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">
                {permission.replace(/_/g, ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {role ? 'Update Role' : 'Create Role'}
        </Button>
      </div>
    </form>
  );
};