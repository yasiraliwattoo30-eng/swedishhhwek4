import React, { useState } from 'react';
import { Upload, Eye, CheckCircle, XCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Input } from '../Input';
import { Modal } from '../Modal';

interface SupplierInvoice {
  id: string;
  supplier_name: string;
  invoice_number: string;
  supplier_invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  currency: string;
  status: 'received' | 'under_review' | 'approved' | 'rejected' | 'paid';
  document_path?: string;
  notes?: string;
  received_by: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  line_items: SupplierInvoiceLineItem[];
  approval_workflow: ApprovalStep[];
}

interface SupplierInvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  line_total: number;
}

interface ApprovalStep {
  id: string;
  step_order: number;
  approver_name: string;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approved_at?: string;
}

const mockSupplierInvoices: SupplierInvoice[] = [
  {
    id: '1',
    supplier_name: 'Office Supplies AB',
    invoice_number: 'SI-2024-001',
    supplier_invoice_number: 'OS-2024-0315',
    invoice_date: '2024-03-15',
    due_date: '2024-04-14',
    total_amount: 15000,
    currency: 'SEK',
    status: 'under_review',
    document_path: '/documents/supplier_invoices/si-2024-001.pdf',
    notes: 'Monthly office supplies order',
    received_by: 'John Secretary',
    created_at: '2024-03-16T09:00:00Z',
    line_items: [
      {
        id: '1',
        description: 'Office paper and stationery',
        quantity: 1,
        unit_price: 12000,
        tax_rate: 25,
        line_total: 12000
      },
      {
        id: '2',
        description: 'Printer cartridges',
        quantity: 3,
        unit_price: 1000,
        tax_rate: 25,
        line_total: 3000
      }
    ],
    approval_workflow: [
      {
        id: '1',
        step_order: 1,
        approver_name: 'Mary Treasurer',
        approver_id: '2',
        status: 'approved',
        comments: 'Amounts verified against purchase order',
        approved_at: '2024-03-16T14:30:00Z'
      },
      {
        id: '2',
        step_order: 2,
        approver_name: 'Jane Chairman',
        approver_id: '1',
        status: 'pending'
      }
    ]
  },
  {
    id: '2',
    supplier_name: 'Legal Services Ltd',
    invoice_number: 'SI-2024-002',
    supplier_invoice_number: 'LS-2024-0320',
    invoice_date: '2024-03-20',
    due_date: '2024-04-19',
    total_amount: 25000,
    currency: 'SEK',
    status: 'approved',
    document_path: '/documents/supplier_invoices/si-2024-002.pdf',
    notes: 'Legal consultation for compliance review',
    received_by: 'John Secretary',
    approved_by: 'Jane Chairman',
    approved_at: '2024-03-21T16:45:00Z',
    created_at: '2024-03-20T11:00:00Z',
    line_items: [
      {
        id: '3',
        description: 'Legal consultation services',
        quantity: 10,
        unit_price: 2000,
        tax_rate: 25,
        line_total: 20000
      },
      {
        id: '4',
        description: 'Document review',
        quantity: 1,
        unit_price: 5000,
        tax_rate: 25,
        line_total: 5000
      }
    ],
    approval_workflow: [
      {
        id: '3',
        step_order: 1,
        approver_name: 'Mary Treasurer',
        approver_id: '2',
        status: 'approved',
        comments: 'Budget approved for legal services',
        approved_at: '2024-03-21T10:15:00Z'
      },
      {
        id: '4',
        step_order: 2,
        approver_name: 'Jane Chairman',
        approver_id: '1',
        status: 'approved',
        comments: 'Final approval granted',
        approved_at: '2024-03-21T16:45:00Z'
      }
    ]
  }
];

export const SupplierInvoiceApproval: React.FC = () => {
  const [supplierInvoices, setSupplierInvoices] = useState<SupplierInvoice[]>(mockSupplierInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoice | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const filteredInvoices = supplierInvoices.filter(invoice => {
    const matchesSearch = invoice.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.supplier_invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'under_review':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-purple-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleApprovalAction = (invoiceId: string, stepId: string, action: 'approve' | 'reject', comments?: string) => {
    setSupplierInvoices(prev => prev.map(invoice => {
      if (invoice.id === invoiceId) {
        const updatedWorkflow = invoice.approval_workflow.map(step => {
          if (step.id === stepId) {
            return {
              ...step,
              status: action === 'approve' ? 'approved' : 'rejected',
              comments: comments || step.comments,
              approved_at: new Date().toISOString()
            };
          }
          return step;
        });

        // Check if all steps are approved
        const allApproved = updatedWorkflow.every(step => step.status === 'approved');
        const hasRejected = updatedWorkflow.some(step => step.status === 'rejected');

        return {
          ...invoice,
          approval_workflow: updatedWorkflow,
          status: hasRejected ? 'rejected' : allApproved ? 'approved' : 'under_review',
          approved_by: allApproved ? 'Current User' : invoice.approved_by,
          approved_at: allApproved ? new Date().toISOString() : invoice.approved_at
        } as SupplierInvoice;
      }
      return invoice;
    }));

    setShowApprovalModal(false);
  };

  const pendingApprovals = filteredInvoices.filter(inv => inv.status === 'under_review').length;
  const totalPendingAmount = filteredInvoices
    .filter(inv => inv.status === 'under_review' || inv.status === 'approved')
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Supplier Invoice Approval</h2>
          <p className="text-gray-600 mt-1">Review and approve supplier invoices with workflow management.</p>
        </div>
        <Button icon={Upload} onClick={() => setShowUploadModal(true)}>
          Upload Invoice
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">{pendingApprovals}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pending Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalPendingAmount.toLocaleString('sv-SE')} SEK
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredInvoices.filter(inv => inv.status === 'approved').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredInvoices.filter(inv => inv.status === 'rejected').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search supplier invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={FileText}
            />
          </div>
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="received">Received</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Supplier Invoices List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {getStatusIcon(invoice.status)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{invoice.invoice_number}</h3>
                    <span className="text-sm text-gray-500">({invoice.supplier_invoice_number})</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{invoice.supplier_name}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Invoice Date:</span>
                      <br />
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Due Date:</span>
                      <br />
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Amount:</span>
                      <br />
                      <span className="text-lg font-semibold text-gray-900">
                        {invoice.total_amount.toLocaleString('sv-SE')} {invoice.currency}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Received By:</span>
                      <br />
                      {invoice.received_by}
                    </div>
                  </div>

                  {/* Approval Workflow Progress */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Approval Progress</h4>
                    <div className="flex items-center space-x-4">
                      {invoice.approval_workflow.map((step, index) => (
                        <div key={step.id} className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              step.status === 'approved' ? 'bg-green-100 text-green-800' :
                              step.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {step.step_order}
                            </div>
                            <span className="text-xs text-gray-600">{step.approver_name}</span>
                          </div>
                          {index < invoice.approval_workflow.length - 1 && (
                            <div className="w-8 h-px bg-gray-300"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {invoice.notes && (
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      <span className="font-medium">Notes:</span> {invoice.notes}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                  {invoice.status.replace('_', ' ')}
                </span>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={Eye}
                    onClick={() => setSelectedInvoice(invoice)}
                  >
                    View
                  </Button>
                  {invoice.status === 'under_review' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setShowApprovalModal(true);
                      }}
                    >
                      Review
                    </Button>
                  )}
                  {invoice.document_path && (
                    <Button variant="ghost" size="sm" icon={FileText}>
                      PDF
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Upload Invoice Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Supplier Invoice"
        size="lg"
      >
        <SupplierInvoiceUploadForm onClose={() => setShowUploadModal(false)} />
      </Modal>

      {/* Invoice Details Modal */}
      <Modal
        isOpen={!!selectedInvoice && !showApprovalModal}
        onClose={() => setSelectedInvoice(null)}
        title="Supplier Invoice Details"
        size="lg"
      >
        {selectedInvoice && <SupplierInvoiceDetails invoice={selectedInvoice} />}
      </Modal>

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title="Review Invoice"
        size="md"
      >
        {selectedInvoice && (
          <ApprovalForm 
            invoice={selectedInvoice}
            onApprove={(stepId, comments) => handleApprovalAction(selectedInvoice.id, stepId, 'approve', comments)}
            onReject={(stepId, comments) => handleApprovalAction(selectedInvoice.id, stepId, 'reject', comments)}
            onCancel={() => setShowApprovalModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

const SupplierInvoiceUploadForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    supplier_name: '',
    supplier_invoice_number: '',
    invoice_date: '',
    due_date: '',
    total_amount: '',
    currency: 'SEK',
    notes: '',
    file: null as File | null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, file }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Supplier Name"
          value={formData.supplier_name}
          onChange={(e) => setFormData(prev => ({ ...prev, supplier_name: e.target.value }))}
          placeholder="Enter supplier name"
          required
        />

        <Input
          label="Supplier Invoice Number"
          value={formData.supplier_invoice_number}
          onChange={(e) => setFormData(prev => ({ ...prev, supplier_invoice_number: e.target.value }))}
          placeholder="Supplier's invoice number"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Invoice Date"
          type="date"
          value={formData.invoice_date}
          onChange={(e) => setFormData(prev => ({ ...prev, invoice_date: e.target.value }))}
          required
        />
        <Input
          label="Due Date"
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
          required
        />
        <Input
          label="Total Amount"
          type="number"
          step="0.01"
          value={formData.total_amount}
          onChange={(e) => setFormData(prev => ({ ...prev, total_amount: e.target.value }))}
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Invoice Document
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          Upload PDF, JPG, or PNG (Max 10MB)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Additional notes about this invoice"
        />
      </div>

      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Upload Invoice
        </Button>
      </div>
    </form>
  );
};

const SupplierInvoiceDetails: React.FC<{ invoice: SupplierInvoice }> = ({ invoice }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{invoice.invoice_number}</h3>
          <p className="text-sm text-gray-600">{invoice.supplier_name}</p>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
          invoice.status === 'approved' ? 'bg-green-100 text-green-800' :
          invoice.status === 'rejected' ? 'bg-red-100 text-red-800' :
          invoice.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {invoice.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Invoice Information</h4>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Supplier Invoice #:</dt>
              <dd className="text-gray-900">{invoice.supplier_invoice_number}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Invoice Date:</dt>
              <dd className="text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Due Date:</dt>
              <dd className="text-gray-900">{new Date(invoice.due_date).toLocaleDateString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Received By:</dt>
              <dd className="text-gray-900">{invoice.received_by}</dd>
            </div>
          </dl>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Amount</h4>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between font-semibold">
              <dt className="text-gray-900">Total Amount:</dt>
              <dd className="text-gray-900">{invoice.total_amount.toLocaleString('sv-SE')} {invoice.currency}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Line Items</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Unit Price
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.line_items.map((line) => (
                <tr key={line.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {line.description}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                    {line.quantity}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                    {line.unit_price.toLocaleString('sv-SE')}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                    {line.line_total.toLocaleString('sv-SE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Workflow */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Approval Workflow</h4>
        <div className="space-y-3">
          {invoice.approval_workflow.map((step) => (
            <div key={step.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
                  {step.step_order}
                </span>
                {step.status === 'approved' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : step.status === 'rejected' ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-gray-900">{step.approver_name}</p>
                {step.comments && (
                  <p className="text-sm text-gray-600 mt-1">{step.comments}</p>
                )}
                {step.approved_at && (
                  <p className="text-xs text-gray-500 mt-1">
                    {step.status === 'approved' ? 'Approved' : 'Rejected'}: {new Date(step.approved_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ApprovalForm: React.FC<{
  invoice: SupplierInvoice;
  onApprove: (stepId: string, comments?: string) => void;
  onReject: (stepId: string, comments?: string) => void;
  onCancel: () => void;
}> = ({ invoice, onApprove, onReject, onCancel }) => {
  const [comments, setComments] = useState('');
  const [action, setAction] = useState<'approve' | 'reject'>('approve');

  const currentStep = invoice.approval_workflow.find(step => step.status === 'pending');

  if (!currentStep) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Action Required</h3>
        <p className="text-gray-600">This invoice has already been processed.</p>
        <Button onClick={onCancel} className="mt-4">Close</Button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (action === 'approve') {
      onApprove(currentStep.id, comments);
    } else {
      onReject(currentStep.id, comments);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{invoice.invoice_number}</h3>
        <p className="text-sm text-gray-600">{invoice.supplier_name}</p>
        <p className="text-lg font-semibold text-gray-900 mt-2">
          {invoice.total_amount.toLocaleString('sv-SE')} {invoice.currency}
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
            <span className="text-sm text-gray-700">Approve Invoice</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="reject"
              checked={action === 'reject'}
              onChange={(e) => setAction(e.target.value as 'reject')}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Reject Invoice</span>
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
          placeholder="Add your approval/rejection comments..."
        />
      </div>

      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant={action === 'reject' ? 'danger' : 'primary'}>
          {action === 'approve' ? 'Approve' : 'Reject'} Invoice
        </Button>
      </div>
    </form>
  );
};