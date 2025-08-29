import React, { useState } from 'react';
import { Shield, Smartphone, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Input } from '../Input';
import { Modal } from '../Modal';

interface BankIDSession {
  id: string;
  session_id: string;
  personal_number: string;
  authentication_type: 'sign' | 'auth';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  order_ref: string;
  auto_start_token?: string;
  completion_data?: {
    user: {
      personal_number: string;
      name: string;
      given_name: string;
      surname: string;
    };
    device: {
      ip_address: string;
      user_agent: string;
    };
    cert: {
      not_before: string;
      not_after: string;
    };
    signature?: string;
  };
  created_at: string;
  completed_at?: string;
}

const mockBankIDSessions: BankIDSession[] = [
  {
    id: '1',
    session_id: 'session_123',
    personal_number: '19801010-1234',
    authentication_type: 'sign',
    status: 'completed',
    order_ref: 'order_456',
    completion_data: {
      user: {
        personal_number: '19801010-1234',
        name: 'John Doe',
        given_name: 'John',
        surname: 'Doe'
      },
      device: {
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0...'
      },
      cert: {
        not_before: '2024-01-01T00:00:00Z',
        not_after: '2025-01-01T00:00:00Z'
      },
      signature: 'digital_signature_data_here'
    },
    created_at: '2024-03-20T10:30:00Z',
    completed_at: '2024-03-20T10:32:15Z'
  },
  {
    id: '2',
    session_id: 'session_789',
    personal_number: '19901010-5678',
    authentication_type: 'auth',
    status: 'pending',
    order_ref: 'order_101',
    auto_start_token: 'auto_start_token_here',
    created_at: '2024-03-20T14:15:00Z'
  }
];

export const BankIDAuthentication: React.FC = () => {
  const [sessions, setSessions] = useState<BankIDSession[]>(mockBankIDSessions);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [currentSession, setCurrentSession] = useState<BankIDSession | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const startBankIDAuth = (type: 'auth' | 'sign', personalNumber: string) => {
    const newSession: BankIDSession = {
      id: Date.now().toString(),
      session_id: `session_${Date.now()}`,
      personal_number: personalNumber,
      authentication_type: type,
      status: 'pending',
      order_ref: `order_${Date.now()}`,
      auto_start_token: `auto_start_${Date.now()}`,
      created_at: new Date().toISOString()
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);

    // Simulate BankID process
    setTimeout(() => {
      setSessions(prev => prev.map(session => 
        session.id === newSession.id 
          ? { 
              ...session, 
              status: 'completed',
              completed_at: new Date().toISOString(),
              completion_data: {
                user: {
                  personal_number: personalNumber,
                  name: 'Test User',
                  given_name: 'Test',
                  surname: 'User'
                },
                device: {
                  ip_address: '192.168.1.100',
                  user_agent: navigator.userAgent
                },
                cert: {
                  not_before: '2024-01-01T00:00:00Z',
                  not_after: '2025-01-01T00:00:00Z'
                },
                signature: type === 'sign' ? 'digital_signature_data' : undefined
              }
            }
          : session
      ));
      setCurrentSession(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">BankID Authentication</h2>
          <p className="text-gray-600 mt-1">Secure authentication and digital signatures using Swedish BankID.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            icon={Shield} 
            variant="secondary"
            onClick={() => setShowAuthModal(true)}
          >
            Authenticate
          </Button>
          <Button 
            icon={Shield}
            onClick={() => setShowSignModal(true)}
          >
            Digital Sign
          </Button>
        </div>
      </div>

      {/* BankID Info */}
      <Card title="BankID Integration" subtitle="Secure Swedish digital identity verification">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">Authentication</h3>
            <p className="text-sm text-gray-600 mt-1">
              Verify user identity using BankID mobile app or security device
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">Digital Signatures</h3>
            <p className="text-sm text-gray-600 mt-1">
              Legally binding digital signatures for documents and transactions
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Smartphone className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900">Mobile Integration</h3>
            <p className="text-sm text-gray-600 mt-1">
              Seamless integration with BankID mobile app for quick verification
            </p>
          </div>
        </div>
      </Card>

      {/* Recent Sessions */}
      <Card title="Recent BankID Sessions" subtitle="Authentication and signing history">
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                {getStatusIcon(session.status)}
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">
                      {session.authentication_type === 'sign' ? 'Digital Signature' : 'Authentication'}
                    </p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Personal Number: {session.personal_number.replace(/(\d{8})-(\d{4})/, '$1-****')}
                  </p>
                  {session.completion_data && (
                    <p className="text-sm text-gray-600">
                      User: {session.completion_data.user.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(session.created_at).toLocaleString()}
                    {session.completed_at && (
                      <> • Completed: {new Date(session.completed_at).toLocaleString()}</>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
                {session.status === 'completed' && session.completion_data?.signature && (
                  <Button variant="ghost" size="sm">
                    Verify Signature
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Current Session Status */}
      {currentSession && (
        <Card>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              BankID {currentSession.authentication_type === 'sign' ? 'Signing' : 'Authentication'} in Progress
            </h3>
            <p className="text-gray-600 mb-4">
              Please complete the process in your BankID app
            </p>
            <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <strong>Order Reference:</strong> {currentSession.order_ref}
              </p>
              {currentSession.auto_start_token && (
                <p className="text-xs text-blue-600 mt-2">
                  Auto-start token available for mobile app integration
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Authentication Modal */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="BankID Authentication"
        size="md"
      >
        <BankIDAuthForm 
          type="auth"
          onSubmit={(personalNumber) => {
            startBankIDAuth('auth', personalNumber);
            setShowAuthModal(false);
          }}
          onCancel={() => setShowAuthModal(false)}
        />
      </Modal>

      {/* Digital Signature Modal */}
      <Modal
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        title="BankID Digital Signature"
        size="md"
      >
        <BankIDAuthForm 
          type="sign"
          onSubmit={(personalNumber) => {
            startBankIDAuth('sign', personalNumber);
            setShowSignModal(false);
          }}
          onCancel={() => setShowSignModal(false)}
        />
      </Modal>
    </div>
  );
};

const BankIDAuthForm: React.FC<{
  type: 'auth' | 'sign';
  onSubmit: (personalNumber: string) => void;
  onCancel: () => void;
}> = ({ type, onSubmit, onCancel }) => {
  const [personalNumber, setPersonalNumber] = useState('');
  const [documentId, setDocumentId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(personalNumber);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          BankID {type === 'sign' ? 'Digital Signature' : 'Authentication'}
        </h3>
        <p className="text-sm text-gray-600">
          {type === 'sign' 
            ? 'Sign documents with legally binding digital signature'
            : 'Verify your identity using Swedish BankID'
          }
        </p>
      </div>

      <Input
        label="Personal Number"
        value={personalNumber}
        onChange={(e) => setPersonalNumber(e.target.value)}
        placeholder="YYYYMMDD-XXXX"
        pattern="[0-9]{8}-[0-9]{4}"
        required
        helperText="Format: 19801010-1234"
      />

      {type === 'sign' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document to Sign
          </label>
          <select
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="">Select Document</option>
            <option value="doc_1">Board Resolution - Q1 Budget</option>
            <option value="doc_2">Annual Financial Statement</option>
            <option value="doc_3">Meeting Minutes - March 2024</option>
            <option value="doc_4">Supplier Invoice - SI-2024-001</option>
          </select>
        </div>
      )}

      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Important Information</h4>
            <ul className="text-sm text-yellow-700 mt-1 space-y-1">
              <li>• Ensure you have your BankID app installed and activated</li>
              <li>• Keep your mobile device nearby during the process</li>
              <li>• {type === 'sign' ? 'Digital signatures are legally binding' : 'Authentication sessions expire after 5 minutes'}</li>
              <li>• Contact support if you experience any issues</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" icon={Shield}>
          Start BankID {type === 'sign' ? 'Signing' : 'Authentication'}
        </Button>
      </div>
    </form>
  );
};