import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Globe, Phone, MapPin } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import type { Foundation } from '../data/mockData';

interface FoundationFormProps {
  foundation?: Foundation;
  onSubmit: (data: Partial<Foundation>) => void;
}

export const FoundationForm: React.FC<FoundationFormProps> = ({ foundation, onSubmit }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: foundation?.name || '',
    registration_number: foundation?.registration_number || '',
    description: foundation?.description || '',
    address: foundation?.address || '',
    phone: foundation?.phone || '',
    website: foundation?.website || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Foundation name is required';
    }
    if (!formData.registration_number.trim()) {
      newErrors.registration_number = 'Registration number is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onSubmit(formData);
      navigate('/foundations');
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({
        ...prev,
        [e.target.name]: ''
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card title={foundation ? 'Edit Foundation' : 'Create New Foundation'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Foundation Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              icon={Building2}
              error={errors.name}
              placeholder="Enter foundation name"
              required
            />
            
            <Input
              label="Registration Number"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleChange}
              error={errors.registration_number}
              placeholder="e.g., GFF-2024-001"
              required
            />
          </div>
          
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
              placeholder="Describe the foundation's mission and activities"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              icon={MapPin}
              placeholder="Foundation address"
            />
            
            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              icon={Phone}
              placeholder="+46 8 123 456 78"
            />
          </div>
          
          <Input
            label="Website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            icon={Globe}
            placeholder="https://example.com"
          />
          
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/foundations')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
            >
              {foundation ? 'Update Foundation' : 'Create Foundation'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};