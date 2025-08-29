import { supabase } from '../config/database';

export interface AuditLogEntry {
  user_id?: string | undefined;
  foundation_id?: string | undefined;
  action: string;
  target_table?: string | undefined;
  target_id?: string | undefined;
  old_values?: Record<string, unknown> | undefined;
  new_values?: Record<string, unknown> | undefined;
  details?: Record<string, unknown> | undefined;
  ip_address?: string | undefined;
  user_agent?: string | undefined;
}

export class AuditService {
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          ...entry,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // Don't throw error to avoid breaking main functionality
    }
  }

  static async logFoundationAction(
    userId: string,
    foundationId: string,
    action: string,
    targetId?: string,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      user_id: userId,
      foundation_id: foundationId,
      action,
      target_table: 'foundations',
      target_id: targetId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  static async logDocumentAction(
    userId: string,
    foundationId: string,
    action: string,
    documentId: string,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      user_id: userId,
      foundation_id: foundationId,
      action,
      target_table: 'documents',
      target_id: documentId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  static async logExpenseAction(
    userId: string,
    foundationId: string,
    action: string,
    expenseId: string,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      user_id: userId,
      foundation_id: foundationId,
      action,
      target_table: 'expenses',
      target_id: expenseId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  static async getAuditLogs(
    foundationId?: string,
    userId?: string,
    action?: string,
    targetTable?: string,
    limit: number = 100
  ): Promise<unknown[]> {
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        profiles(full_name, email)
      `)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (foundationId) {
      query = query.eq('foundation_id', foundationId);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (action) {
      query = query.eq('action', action);
    }
    if (targetTable) {
      query = query.eq('target_table', targetTable);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }
}