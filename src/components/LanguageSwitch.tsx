import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSwitch: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'sv' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
      title={i18n.language === 'en' ? 'Switch to Swedish' : 'Växla till engelska'}
    >
      <Globe className="w-4 h-4" />
      <span className="hidden sm:inline">
        {i18n.language === 'en' ? 'Svenska' : 'English'}
      </span>
      <span className="sm:hidden">
        {i18n.language === 'en' ? 'SV' : 'EN'}
      </span>
    </button>
  );
};