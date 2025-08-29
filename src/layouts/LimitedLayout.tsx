import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Calendar, Settings, LogOut, Clock } from 'lucide-react';
import { Button } from '../components/Button';

interface LimitedLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const limitedNavigation = [
  { name: 'Dashboard', href: '/dashboard-limited', icon: Building2 },
  { name: 'User Management', href: '/limited/users', icon: Users },
  { name: 'Meeting Planning', href: '/limited/meetings', icon: Calendar },
  { name: 'Foundation Setup', href: '/limited/settings', icon: Settings },
];

export const LimitedLayout: React.FC<LimitedLayoutProps> = ({ children, onLogout }) => {
  return (
    <div className="h-screen flex bg-gray-50">
      {/* Limited Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 h-full">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <Building2 className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">FAASINOVA</span>
          </div>
          <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-800">Limited Access</span>
            </div>
          </div>
        </div>
        
        <nav className="px-3 pb-6">
          <ul className="space-y-1">
            {limitedNavigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Limited Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Foundation Setup</h1>
              <p className="text-sm text-gray-600">Registration pending verification</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 rounded-full">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Awaiting Verification</span>
              </div>
              
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};