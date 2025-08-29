import { Response } from 'express';
import { BankIDService } from '../services/BankIDService';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { AuditService } from '../services/AuditService';
import { supabase } from '../config/database';

export class BankIDController {
  static initiateAuthentication = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { personal_number } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    if (!BankIDService.validatePersonalNumber(personal_number)) {
      throw createError('Invalid personal number format', 400);
    }

    const session = await BankIDService.initiateAuthentication(personal_number, userId);

    // Log audit trail
    await AuditService.log({
      user_id: userId,
      action: 'bankid_auth_initiated',
      details: { 
        personal_number: personal_number.replace(/(\d{8})-(\d{4})/, '$1-****'),
        order_ref: session.order_ref 
      },
      ip_address: req.ip ?? '',
      user_agent: req.get('User-Agent') ?? ''
    });

    res.status(201).json({
      message: 'BankID authentication initiated',
      session: {
        order_ref: session.order_ref,
        auto_start_token: session.auto_start_token,
        status: session.status
      }
    });
  });

  static initiateSignature = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { personal_number, document_id } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    if (!BankIDService.validatePersonalNumber(personal_number)) {
      throw createError('Invalid personal number format', 400);
    }

    // Verify document exists and user has access
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, file_name, foundation_id')
      .eq('id', document_id)
      .single();

    if (docError || !document) {
      throw createError('Document not found', 404);
    }

    const session = await BankIDService.initiateSignature(personal_number, userId, document_id);

    // Log audit trail
    await AuditService.log({
      user_id: userId,
      foundation_id: document.foundation_id,
      action: 'bankid_signature_initiated',
      target_table: 'documents',
      target_id: document_id,
      details: { 
        personal_number: personal_number.replace(/(\d{8})-(\d{4})/, '$1-****'),
        order_ref: session.order_ref,
        document_name: document.file_name
      },
      ip_address: req.ip ?? '',
      user_agent: req.get('User-Agent') ?? ''
    });

    res.status(201).json({
      message: 'BankID signature initiated',
      session: {
        order_ref: session.order_ref,
        auto_start_token: session.auto_start_token,
        status: session.status
      }
    });
  });

  static checkStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { orderRef } = req.params;

    if (!orderRef) {
      throw createError('Order reference is required', 400);
    }

    const session = await BankIDService.checkStatus(orderRef);

    if (!session) {
      throw createError('BankID session not found', 404);
    }

    // Verify user owns this session
    if (session.user_id !== req.user?.id) {
      throw createError('Access denied to this BankID session', 403);
    }

    res.json({
      session: {
        order_ref: session.order_ref,
        status: session.status,
        authentication_type: session.authentication_type,
        created_at: session.created_at,
        completed_at: session.completed_at,
        completion_data: session.completion_data
      }
    });
  });

  static completeProcess = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { order_ref, completion_data } = req.body;

    const session = await BankIDService.completeSession(order_ref, completion_data);

    // Log successful completion
    await AuditService.log({
      user_id: session.user_id,
      action: `bankid_${session.authentication_type}_completed`,
      details: {
        order_ref: session.order_ref,
        personal_number: session.personal_number.replace(/(\d{8})-(\d{4})/, '$1-****'),
        user_name: completion_data.user?.name
      },
      ip_address: req.ip ?? '',
      user_agent: req.get('User-Agent') ?? ''
    });

    res.json({
      message: `BankID ${session.authentication_type} completed successfully`,
      session: {
        order_ref: session.order_ref,
        status: session.status,
        completed_at: session.completed_at
      }
    });
  });

  static cancelProcess = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { order_ref } = req.body;

    await BankIDService.cancelSession(order_ref);

    // Log cancellation
    if (!req.user?.id) {
      throw createError('User not authenticated', 401);
    }
    await AuditService.log({
      user_id: req.user.id,
      action: 'bankid_cancelled',
      details: { order_ref },
      ip_address: req.ip ?? '',
      user_agent: req.get('User-Agent') ?? ''
    });

    res.json({
      message: 'BankID process cancelled successfully'
    });
  });

  static getUserSessions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;

    const { data: sessions, error } = await supabase
      .from('bankid_sessions')
      .select('id, order_ref, authentication_type, status, created_at, completed_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({
      sessions: sessions || [],
      total: sessions?.length || 0
    });
  });
}