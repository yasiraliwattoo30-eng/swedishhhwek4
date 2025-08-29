import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { getDefaultRoute } from '../utils/permissions';

interface LoginPageProps {
  onLogin: (role?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Simulate API call with role-based authentication
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      setLoading(false);
      
      // Store session data
      localStorage.setItem('auth_token', data.session.access_token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      
      onLogin(data.user.role);
    } catch (err) {
      setLoading(false);
      
      // For demo purposes, allow mock login with predefined credentials
      const mockCredentials = [
        { email: 'admin@example.com', password: 'AdminPass123', role: 'admin' },
        { email: 'manager@example.com', password: 'ManagerPass123', role: 'foundation_owner' },
        { email: 'developer@example.com', password: 'DevPass123', role: 'member' }
      ];
      
      const mockUser = mockCredentials.find(
        cred => cred.email === formData.email && cred.password === formData.password
      );
      
      if (mockUser) {
        // Mock successful login
        localStorage.setItem('auth_token', 'mock_token_' + mockUser.role);
        localStorage.setItem('user_data', JSON.stringify({
          id: 'mock_' + mockUser.role,
          email: mockUser.email,
          role: mockUser.role,
          full_name: mockUser.role === 'admin' ? 'System Administrator' :
                     mockUser.role === 'foundation_owner' ? 'Foundation Manager' :
                     'Developer User'
        }));
        onLogin(mockUser.role);
        
        // Navigate to role-specific dashboard
        navigate(getDefaultRoute(mockUser.role));
      } else {
        setError('Invalid email or password. Try the demo credentials.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          icon={Mail}
          error={error}
          required
          placeholder="Enter your email"
        />
        
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          icon={Lock}
          required
          placeholder="Enter your password"
        />
        
        {/* Demo Credentials Helper */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h4>
          <div className="text-xs text-blue-800 space-y-1">
            <div><strong>Admin:</strong> admin@example.com / AdminPass123</div>
            <div><strong>Manager:</strong> manager@example.com / ManagerPass123</div>
            <div><strong>Developer:</strong> developer@example.com / DevPass123</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
              Forgot your password?
            </a>
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          loading={loading}
        >
          Sign In
        </Button>
        
        <div className="text-center">
          <span className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Sign up
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
};