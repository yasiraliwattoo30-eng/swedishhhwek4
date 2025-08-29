import { Response } from 'express';
import { supabase } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export class GovernanceController {
  static getRoles = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { foundation_id } = req.query;

    const { data: roles, error } = await supabase
      .from('roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({
      roles: roles || [],
      total: roles?.length || 0
    });
  });

  static createRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      foundation_id,
      name,
      description,
      permissions
    } = req.body;

    const { data: role, error } = await supabase
      .from('roles')
      .insert({
        name,
        description,
        permissions,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.status(201).json({
      message: 'Role created successfully',
      role
    });
  });

  static getDocumentWorkflows = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { foundation_id } = req.query;

    // This would query document workflows from a dedicated table
    // For now, return mock data structure
    const workflows = [
      {
        id: '1',
        document_id: 'doc_1',
        document_name: 'Board Resolution - Q1 Budget',
        workflow_type: 'approval',
        status: 'in_progress',
        steps: [
          {
            id: '1',
            step_order: 1,
            assignee_name: 'John Secretary',
            action_type: 'review',
            status: 'completed'
          },
          {
            id: '2',
            step_order: 2,
            assignee_name: 'Jane Chairman',
            action_type: 'approve',
            status: 'pending'
          }
        ],
        created_at: new Date().toISOString()
      }
    ];

    res.json({
      workflows,
      total: workflows.length
    });
  });

  static createDocumentWorkflow = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      document_id,
      workflow_type,
      steps
    } = req.body;

    // This would create a workflow in the database
    // For now, return success response
    res.status(201).json({
      message: 'Document workflow created successfully',
      workflow: {
        id: Date.now().toString(),
        document_id,
        workflow_type,
        status: 'pending',
        steps,
        created_at: new Date().toISOString()
      }
    });
  });

  static processWorkflowAction = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { step_id, action, comments } = req.body;

    // This would update the workflow step in the database
    // For now, return success response
    res.json({
      message: `Workflow step ${action}d successfully`,
      step: {
        id: step_id,
        status: action === 'approve' ? 'completed' : 'rejected',
        comments,
        completed_at: new Date().toISOString()
      }
    });
  });

  static getComplianceItems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { foundation_id } = req.query;

    // This would query compliance items from a dedicated table
    // For now, return mock data
    const complianceItems = [
      {
        id: '1',
        foundation_id: foundation_id || '1',
        regulation_type: 'lansstyrelsen',
        title: 'Annual Activity Report',
        description: 'Submit annual report to Länsstyrelsen',
        due_date: '2024-04-30',
        status: 'in_progress',
        priority: 'high',
        assigned_to: 'John Secretary',
        created_at: new Date().toISOString()
      }
    ];

    res.json({
      compliance_items: complianceItems,
      total: complianceItems.length
    });
  });

  static createComplianceItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      foundation_id,
      regulation_type,
      title,
      description,
      due_date,
      priority,
      assigned_to
    } = req.body;

    // This would create a compliance item in the database
    const complianceItem = {
      id: Date.now().toString(),
      foundation_id,
      regulation_type,
      title,
      description,
      due_date,
      status: 'pending',
      priority,
      assigned_to,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    res.status(201).json({
      message: 'Compliance item created successfully',
      compliance_item: complianceItem
    });
  });

  static getAuditLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { foundation_id, action, target_table } = req.query;

    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        profiles(full_name, email)
      `)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (foundation_id) {
      query = query.eq('foundation_id', foundation_id);
    }
    if (action) {
      query = query.eq('action', action);
    }
    if (target_table) {
      query = query.eq('target_table', target_table);
    }

    const { data: logs, error } = await query;

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({
      audit_logs: logs || [],
      total: logs?.length || 0
    });
  });
}