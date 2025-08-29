import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import { Button } from './Button';
import { LanguageSwitch } from './LanguageSwitch';
import { mockUser } from '../data/mockData';

interface HeaderProps {
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  // Get user data from localStorage for demo
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const currentUser = {
    ...mockUser,
    ...userData
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Foundation Management</h1>
          <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Manage your foundations efficiently</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <LanguageSwitch />
          
          <Button variant="ghost" size="sm">
            <Bell className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2">
              <img
                src={currentUser.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
                alt={currentUser.full_name}
                className="w-8 h-8 rounded-full"
              />
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900">{currentUser.full_name}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-600">{currentUser.email}</p>
                  {currentUser.role && (
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      currentUser.role === 'admin' ? 'bg-red-100 text-red-800' :
                      currentUser.role === 'foundation_owner' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {currentUser.role}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <img
              src={currentUser.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
              alt={currentUser.full_name}
              className="w-8 h-8 rounded-full sm:hidden"
            />
            
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};