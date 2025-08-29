import React, { useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, User, MessageSquare } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Modal } from '../Modal';

interface WorkflowStep {
  id: string;
  step_order: number;
  assignee_name: string;
  assignee_id: string;
  action_type: 'review' | 'approve' | 'sign';
  status: 'pending' | 'completed' | 'rejected';
  completed_at?: string;
  comments?: string;
  digital_signature?: string;
}

interface DocumentWorkflow {
  id: string;
  document_name: string;
  document_type: string;
  workflow_type: 'approval' | 'review' | 'signature';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  steps: WorkflowStep[];
  created_at: string;
  completed_at?: string;
}

const mockWorkflows: DocumentWorkflow[] = [
  {
    id: '1',
    document_name: 'Board Resolution - Q1 Budget Approval',
    document_type: 'board_resolution',
    workflow_type: 'approval',
    status: 'in_progress',
    created_at: '2024-03-15T10:00:00Z',
    steps: [
      {
        id: '1',
        step_order: 1,
        assignee_name: 'John Secretary',
        assignee_id: '1',
        action_type: 'review',
        status: 'completed',
        completed_at: '2024-03-15T14:30:00Z',
        comments: 'Document reviewed and formatted correctly.'
      },
      {
        id: '2',
        step_order: 2,
        assignee_name: 'Jane Chairman',
        assignee_id: '2',
        action_type: 'approve',
        status: 'pending'
      },
      {
        id: '3',
        step_order: 3,
        assignee_name: 'Board Members',
        assignee_id: '3',
        action_type: 'sign',
        status: 'pending'
      }
    ]
  },
  {
    id: '2',
    document_name: 'Annual Financial Statement 2023',
    document_type: 'financial_statement',
    workflow_type: 'signature',
    status: 'completed',
    created_at: '2024-02-01T09:00:00Z',
    completed_at: '2024-02-15T16:45:00Z',
    steps: [
      {
        id: '4',
        step_order: 1,
        assignee_name: 'External Auditor',
        assignee_id: '4',
        action_type: 'review',
        status: 'completed',
        completed_at: '2024-02-10T12:00:00Z',
        comments: 'Financial statements comply with accounting standards.'
      },
      {
        id: '5',
        step_order: 2,
        assignee_name: 'Jane Chairman',
        assignee_id: '2',
        action_type: 'sign',
        status: 'completed',
        completed_at: '2024-02-15T16:45:00Z',
        digital_signature: 'BankID-verified'
      }
    ]
  }
];

export const DocumentWorkflow: React.FC = () => {
  const [workflows, setWorkflows] = useState<DocumentWorkflow[]>(mockWorkflows);
  const [selectedWorkflow, setSelectedWorkflow] = useState<DocumentWorkflow | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleStepAction = (workflowId: string, stepId: string, action: 'approve' | 'reject', comments?: string) => {
    setWorkflows(prev => prev.map(workflow => {
      if (workflow.id === workflowId) {
        const updatedSteps = workflow.steps.map(step => {
          if (step.id === stepId) {
            return {
              ...step,
              status: action === 'approve' ? 'completed' : 'rejected',
              completed_at: new Date().toISOString(),
              comments: comments || step.comments
            } as WorkflowStep;
          }
          return step;
        });

        // Check if workflow is complete
        const allCompleted = updatedSteps.every(step => step.status === 'completed');
        const hasRejected = updatedSteps.some(step => step.status === 'rejected');

        return {
          ...workflow,
          steps: updatedSteps,
          status: hasRejected ? 'rejected' : allCompleted ? 'completed' : 'in_progress',
          completed_at: allCompleted ? new Date().toISOString() : undefined
        } as DocumentWorkflow;
      }
      return workflow;
    }));

    setShowActionModal(false);
    setSelectedStep(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Document Workflows</h2>
        <p className="text-gray-600 mt-1">Track document approval and signature processes.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <FileText className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{workflow.document_name}</h3>
                  <p className="text-sm text-gray-600">
                    {workflow.workflow_type.charAt(0).toUpperCase() + workflow.workflow_type.slice(1)} Workflow
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Created: {new Date(workflow.created_at).toLocaleDateString()}
                    {workflow.completed_at && (
                      <> • Completed: {new Date(workflow.completed_at).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(workflow.status)}`}>
                  {workflow.status.replace('_', ' ')}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedWorkflow(workflow)}
                >
                  View Details
                </Button>
              </div>
            </div>

            {/* Workflow Steps */}
            <div className="space-y-3">
              {workflow.steps.map((step) => (
                <div key={step.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {step.step_order}
                    </span>
                    {getStatusIcon(step.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{step.assignee_name}</span>
                      <span className="text-xs text-gray-500">({step.action_type})</span>
                    </div>
                    {step.comments && (
                      <div className="flex items-start space-x-2 mt-1">
                        <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5" />
                        <p className="text-xs text-gray-600">{step.comments}</p>
                      </div>
                    )}
                    {step.completed_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        Completed: {new Date(step.completed_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {step.status === 'pending' && (
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => {
                          setSelectedStep(step);
                          setShowActionModal(true);
                        }}
                      >
                        Take Action
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Workflow Details Modal */}
      <Modal
        isOpen={!!selectedWorkflow}
        onClose={() => setSelectedWorkflow(null)}
        title="Workflow Details"
        size="lg"
      >
        {selectedWorkflow && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedWorkflow.document_name}</h3>
              <p className="text-sm text-gray-600">{selectedWorkflow.document_type.replace('_', ' ')}</p>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Workflow Progress</h4>
              <div className="space-y-3">
                {selectedWorkflow.steps.map((step) => (
                  <div key={step.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {step.step_order}
                      </span>
                      {getStatusIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{step.assignee_name}</p>
                      <p className="text-sm text-gray-600 capitalize">{step.action_type}</p>
                      {step.comments && (
                        <p className="text-sm text-gray-700 mt-1">{step.comments}</p>
                      )}
                      {step.digital_signature && (
                        <p className="text-xs text-green-600 mt-1">✓ Digitally signed via {step.digital_signature}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title="Take Action"
        size="md"
      >
        {selectedStep && (
          <WorkflowActionForm
            step={selectedStep}
            onSubmit={(action, comments) => {
              const workflow = workflows.find(w => w.steps.some(s => s.id === selectedStep.id));
              if (workflow) {
                handleStepAction(workflow.id, selectedStep.id, action, comments);
              }
            }}
            onCancel={() => setShowActionModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

interface WorkflowActionFormProps {
  step: WorkflowStep;
  onSubmit: (action: 'approve' | 'reject', comments?: string) => void;
  onCancel: () => void;
}

const WorkflowActionForm: React.FC<WorkflowActionFormProps> = ({ step, onSubmit, onCancel }) => {
  const [comments, setComments] = useState('');
  const [action, setAction] = useState<'approve' | 'reject'>('approve');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(action, comments);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-gray-600 mb-2">
          Action required: <span className="font-medium capitalize">{step.action_type}</span>
        </p>
        <p className="text-sm text-gray-600">
          Assigned to: <span className="font-medium">{step.assignee_name}</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Decision
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="approve"
              checked={action === 'approve'}
              onChange={(e) => setAction(e.target.value as 'approve')}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">
              {step.action_type === 'sign' ? 'Sign Document' : 'Approve'}
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="reject"
              checked={action === 'reject'}
              onChange={(e) => setAction(e.target.value as 'reject')}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Reject</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comments
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Add your comments..."
        />
      </div>

      {step.action_type === 'sign' && action === 'approve' && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            🔐 This action will require BankID verification for digital signature.
          </p>
        </div>
      )}

      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant={action === 'reject' ? 'danger' : 'primary'}>
          {action === 'approve' && step.action_type === 'sign' ? 'Sign with BankID' : 
           action === 'approve' ? 'Approve' : 'Reject'}
        </Button>
      </div>
    </form>
  );
};