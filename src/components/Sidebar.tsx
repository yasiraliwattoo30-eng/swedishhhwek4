import React from 'react';
import { NavLink } from 'react-router-dom';
import { hasPermission } from '../utils/permissions';
import {
  Home,
  Building2,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  FolderOpen,
  Gift,
  User,
  Settings,
  BarChart3,
  Shield,
  Calculator
} from 'lucide-react';

const allNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, screen: 'dashboard' },
  { name: 'Manager Dashboard', href: '/manager-dashboard', icon: Home, screen: 'manager-dashboard' },
  { name: 'Foundations', href: '/foundations', icon: Building2, screen: 'foundations' },
  { name: 'Governance', href: '/governance', icon: Shield, screen: 'governance' },
  { name: 'Documents', href: '/documents', icon: FileText, screen: 'documents' },
  { name: 'Financial', href: '/financial', icon: Calculator, screen: 'financial' },
  { name: 'Meetings', href: '/meetings', icon: Calendar, screen: 'meetings' },
  { name: 'Expenses', href: '/expenses', icon: DollarSign, screen: 'expenses' },
  { name: 'Investments', href: '/investments', icon: TrendingUp, screen: 'investments' },
  { name: 'Projects', href: '/projects', icon: FolderOpen, screen: 'projects' },
  { name: 'Grants', href: '/grants', icon: Gift, screen: 'grants' },
  { name: 'Reports', href: '/reports', icon: BarChart3, screen: 'reports' },
  { name: 'Profile', href: '/profile', icon: User, screen: 'profile' },
  { name: 'Settings', href: '/settings', icon: Settings, screen: 'settings' },
];

export const Sidebar: React.FC = () => {
  // Get user data from localStorage for demo
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userRole = userData.role || 'member';

  // Filter navigation based on user role and permissions
  const filteredNavigation = allNavigation.filter(item => {
    // If no screen specified, allow for backwards compatibility
    if (!item.screen) return true;
    
    return hasPermission(userRole, item.screen);
  });

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <Building2 className="w-8 h-8 text-primary-600" />
          <span className="text-lg xl:text-xl font-bold text-gray-900">FoundationMS</span>
        </div>
        {userRole && (
          <div className="mt-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              userRole === 'admin' ? 'bg-red-100 text-red-800' :
              userRole === 'foundation_owner' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {userRole.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>
      
      <nav className="px-3 pb-6 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {filteredNavigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 group ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};