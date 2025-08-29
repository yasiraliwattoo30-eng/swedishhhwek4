import React, { useState } from 'react';
import { Calendar, Users, FileText, Signature, Clock, CheckCircle } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { Input } from '../Input';

interface MeetingMinutes {
  id: string;
  meeting_id: string;
  meeting_title: string;
  content: string;
  attendees_present: Attendee[];
  decisions_made: Decision[];
  action_items: ActionItem[];
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  status: 'draft' | 'pending_approval' | 'approved';
  digital_signatures: DigitalSignature[];
  created_at: string;
  updated_at: string;
}

interface Attendee {
  id: string;
  name: string;
  role: string;
  present: boolean;
}

interface Decision {
  id: string;
  title: string;
  description: string;
  decision_type: 'resolution' | 'policy' | 'budget' | 'other';
  votes_for: number;
  votes_against: number;
  abstentions: number;
  outcome: 'passed' | 'rejected';
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
}

interface DigitalSignature {
  id: string;
  signer_name: string;
  signer_id: string;
  signature_method: 'bankid' | 'manual';
  signed_at: string;
}

const mockMeetingMinutes: MeetingMinutes[] = [
  {
    id: '1',
    meeting_id: '1',
    meeting_title: 'Board Meeting - Q1 Review',
    content: `Meeting called to order at 14:00 by Chairman Jane Smith.

AGENDA ITEMS:
1. Review of Q1 Financial Performance
2. Approval of New Investment Strategy
3. Board Member Appointment
4. Compliance Update

DISCUSSIONS:
The board reviewed the Q1 financial statements showing a 15% increase in foundation assets. The investment committee presented a new ESG-focused investment strategy aligned with our environmental mission.

RESOLUTIONS:
- Resolution 2024-001: Approved new investment strategy (5 votes for, 0 against, 1 abstention)
- Resolution 2024-002: Appointed John Doe as new board member (6 votes for, 0 against)`,
    attendees_present: [
      { id: '1', name: 'Jane Smith', role: 'Chairman', present: true },
      { id: '2', name: 'John Secretary', role: 'Secretary', present: true },
      { id: '3', name: 'Mary Treasurer', role: 'Treasurer', present: true },
      { id: '4', name: 'Bob Member', role: 'Board Member', present: false },
      { id: '5', name: 'Alice Member', role: 'Board Member', present: true }
    ],
    decisions_made: [
      {
        id: '1',
        title: 'New Investment Strategy Approval',
        description: 'Approve ESG-focused investment strategy for foundation assets',
        decision_type: 'policy',
        votes_for: 5,
        votes_against: 0,
        abstentions: 1,
        outcome: 'passed'
      },
      {
        id: '2',
        title: 'Board Member Appointment',
        description: 'Appoint John Doe as new board member',
        decision_type: 'resolution',
        votes_for: 6,
        votes_against: 0,
        abstentions: 0,
        outcome: 'passed'
      }
    ],
    action_items: [
      {
        id: '1',
        title: 'Implement new investment strategy',
        description: 'Work with investment advisor to implement ESG strategy',
        assigned_to: 'Mary Treasurer',
        due_date: '2024-05-01',
        priority: 'high',
        status: 'in_progress'
      },
      {
        id: '2',
        title: 'Onboard new board member',
        description: 'Complete onboarding process for John Doe',
        assigned_to: 'John Secretary',
        due_date: '2024-04-15',
        priority: 'medium',
        status: 'pending'
      }
    ],
    created_by: 'John Secretary',
    approved_by: 'Jane Smith',
    approved_at: '2024-03-16T10:30:00Z',
    status: 'approved',
    digital_signatures: [
      {
        id: '1',
        signer_name: 'Jane Smith',
        signer_id: '1',
        signature_method: 'bankid',
        signed_at: '2024-03-16T10:30:00Z'
      },
      {
        id: '2',
        signer_name: 'John Secretary',
        signer_id: '2',
        signature_method: 'bankid',
        signed_at: '2024-03-16T10:32:00Z'
      }
    ],
    created_at: '2024-03-15T16:30:00Z',
    updated_at: '2024-03-16T10:32:00Z'
  }
];

export const MeetingGovernance: React.FC = () => {
  const [meetingMinutes, setMeetingMinutes] = useState<MeetingMinutes[]>(mockMeetingMinutes);
  const [selectedMinutes, setSelectedMinutes] = useState<MeetingMinutes | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending_approval':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const handleApproveMinutes = (minutesId: string) => {
    setMeetingMinutes(prev => prev.map(minutes => 
      minutes.id === minutesId 
        ? { 
            ...minutes, 
            status: 'approved',
            approved_by: 'Current User',
            approved_at: new Date().toISOString()
          }
        : minutes
    ));
  };

  const handleDigitalSignature = (minutesId: string) => {
    const newSignature: DigitalSignature = {
      id: Date.now().toString(),
      signer_name: 'Current User',
      signer_id: 'current',
      signature_method: 'bankid',
      signed_at: new Date().toISOString()
    };

    setMeetingMinutes(prev => prev.map(minutes => 
      minutes.id === minutesId 
        ? { 
            ...minutes, 
            digital_signatures: [...minutes.digital_signatures, newSignature]
          }
        : minutes
    ));
    setShowSignatureModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meeting Governance</h2>
          <p className="text-gray-600 mt-1">Manage meeting minutes, decisions, and digital signatures.</p>
        </div>
        <Button icon={FileText} onClick={() => setShowCreateModal(true)}>
          Create Minutes
        </Button>
      </div>

      {/* Meeting Minutes List */}
      <div className="grid grid-cols-1 gap-6">
        {meetingMinutes.map((minutes) => (
          <Card key={minutes.id}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                {getStatusIcon(minutes.status)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{minutes.meeting_title}</h3>
                  <p className="text-sm text-gray-600">
                    Created by {minutes.created_by} on {new Date(minutes.created_at).toLocaleDateString()}
                  </p>
                  {minutes.approved_by && (
                    <p className="text-sm text-gray-600">
                      Approved by {minutes.approved_by} on {new Date(minutes.approved_at!).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(minutes.status)}`}>
                  {minutes.status.replace('_', ' ')}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedMinutes(minutes)}
                >
                  View Details
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {minutes.attendees_present.filter(a => a.present).length} attendees
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {minutes.decisions_made.length} decisions
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {minutes.action_items.length} action items
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Signature className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {minutes.digital_signatures.length} signatures
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
              {minutes.status === 'draft' && (
                <Button size="sm" variant="secondary">
                  Submit for Approval
                </Button>
              )}
              {minutes.status === 'pending_approval' && (
                <Button 
                  size="sm"
                  onClick={() => handleApproveMinutes(minutes.id)}
                >
                  Approve Minutes
                </Button>
              )}
              {minutes.status === 'approved' && (
                <Button 
                  size="sm" 
                  variant="secondary"
                  icon={Signature}
                  onClick={() => {
                    setSelectedMinutes(minutes);
                    setShowSignatureModal(true);
                  }}
                >
                  Digital Sign
                </Button>
              )}
              <Button size="sm" variant="ghost">
                Export PDF
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Meeting Minutes Details Modal */}
      <Modal
        isOpen={!!selectedMinutes}
        onClose={() => setSelectedMinutes(null)}
        title="Meeting Minutes Details"
        size="xl"
      >
        {selectedMinutes && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedMinutes.meeting_title}</h3>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {selectedMinutes.content}
                </pre>
              </div>
            </div>

            {/* Attendees */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Attendees</h4>
              <div className="grid grid-cols-2 gap-3">
                {selectedMinutes.attendees_present.map((attendee) => (
                  <div key={attendee.id} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${attendee.present ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-gray-700">{attendee.name} ({attendee.role})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decisions */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Decisions Made</h4>
              <div className="space-y-3">
                {selectedMinutes.decisions_made.map((decision) => (
                  <div key={decision.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{decision.title}</h5>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        decision.outcome === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {decision.outcome}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{decision.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>For: {decision.votes_for}</span>
                      <span>Against: {decision.votes_against}</span>
                      <span>Abstentions: {decision.abstentions}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Action Items</h4>
              <div className="space-y-3">
                {selectedMinutes.action_items.map((item) => (
                  <div key={item.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{item.title}</h5>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.priority === 'high' ? 'bg-red-100 text-red-800' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' :
                          item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Assigned to: {item.assigned_to}</span>
                      <span>Due: {new Date(item.due_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Digital Signatures */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Digital Signatures</h4>
              <div className="space-y-2">
                {selectedMinutes.digital_signatures.map((signature) => (
                  <div key={signature.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <div className="flex items-center space-x-2">
                      <Signature className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">{signature.signer_name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">
                        Signed via {signature.signature_method.toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(signature.signed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Digital Signature Modal */}
      <Modal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        title="Digital Signature"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <Signature className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Meeting Minutes</h3>
            <p className="text-sm text-gray-600">
              You are about to digitally sign the meeting minutes using BankID verification.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">What happens when you sign:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your identity will be verified using BankID</li>
              <li>• A cryptographic signature will be attached to the document</li>
              <li>• The signature will be legally binding</li>
              <li>• An audit trail will be created</li>
            </ul>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setShowSignatureModal(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => selectedMinutes && handleDigitalSignature(selectedMinutes.id)}
              icon={Signature}
            >
              Sign with BankID
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Minutes Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Meeting Minutes"
        size="lg"
      >
        <MinutesForm onClose={() => setShowCreateModal(false)} />
      </Modal>
    </div>
  );
};

const MinutesForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    meeting_title: '',
    content: '',
    attendees: '',
    decisions: '',
    action_items: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Meeting Title"
        value={formData.meeting_title}
        onChange={(e) => setFormData(prev => ({ ...prev, meeting_title: e.target.value }))}
        placeholder="e.g., Board Meeting - Q1 Review"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Meeting Content
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Enter the detailed meeting minutes..."
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attendees (one per line)
          </label>
          <textarea
            value={formData.attendees}
            onChange={(e) => setFormData(prev => ({ ...prev, attendees: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Jane Smith - Chairman&#10;John Doe - Secretary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Action Items (one per line)
          </label>
          <textarea
            value={formData.action_items}
            onChange={(e) => setFormData(prev => ({ ...prev, action_items: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Review budget proposal - John Doe - 2024-04-15"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Create Minutes
        </Button>
      </div>
    </form>
  );
};