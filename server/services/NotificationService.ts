import { supabase } from '../config/database';

export interface NotificationData {
  user_id: string;
  foundation_id?: string;
  type: 'document_approved' | 'meeting_scheduled' | 'expense_approved' | 'expense_rejected' | 'compliance_due' | 'general';
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export class NotificationService {
  static async sendNotification(notification: NotificationData): Promise<void> {
    try {
      // This would integrate with email service, push notifications, etc.
      // For now, just log the notification
      console.log('Notification sent:', {
        to: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message
      });

      // Store notification in database (if you have a notifications table)
      // await supabase.from('notifications').insert({
      //   ...notification,
      //   created_at: new Date().toISOString(),
      //   read: false
      // });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  static async notifyDocumentApproval(
    userId: string,
    foundationId: string,
    documentName: string,
    approved: boolean
  ): Promise<void> {
    await this.sendNotification({
      user_id: userId,
      foundation_id: foundationId,
      type: 'document_approved',
      title: `Document ${approved ? 'Approved' : 'Rejected'}`,
      message: `Your document "${documentName}" has been ${approved ? 'approved' : 'rejected'}.`,
      priority: 'medium'
    });
  }

  static async notifyMeetingScheduled(
    userIds: string[],
    foundationId: string,
    meetingTitle: string,
    meetingDate: string
  ): Promise<void> {
    for (const userId of userIds) {
      await this.sendNotification({
        user_id: userId,
        foundation_id: foundationId,
        type: 'meeting_scheduled',
        title: 'New Meeting Scheduled',
        message: `A new meeting "${meetingTitle}" has been scheduled for ${new Date(meetingDate).toLocaleDateString()}.`,
        priority: 'medium'
      });
    }
  }

  static async notifyExpenseStatus(
    userId: string,
    foundationId: string,
    expenseDescription: string,
    approved: boolean,
    rejectionReason?: string
  ): Promise<void> {
    await this.sendNotification({
      user_id: userId,
      foundation_id: foundationId,
      type: approved ? 'expense_approved' : 'expense_rejected',
      title: `Expense ${approved ? 'Approved' : 'Rejected'}`,
      message: approved 
        ? `Your expense "${expenseDescription}" has been approved.`
        : `Your expense "${expenseDescription}" has been rejected. Reason: ${rejectionReason}`,
      priority: 'medium'
    });
  }

  static async notifyComplianceDeadline(
    userId: string,
    foundationId: string,
    complianceTitle: string,
    dueDate: string,
    daysRemaining: number
  ): Promise<void> {
    const priority = daysRemaining <= 3 ? 'urgent' : daysRemaining <= 7 ? 'high' : 'medium';
    
    await this.sendNotification({
      user_id: userId,
      foundation_id: foundationId,
      type: 'compliance_due',
      title: 'Compliance Deadline Approaching',
      message: `"${complianceTitle}" is due in ${daysRemaining} days (${new Date(dueDate).toLocaleDateString()}).`,
      priority
    });
  }

  static async notifyFoundationMembers(
    foundationId: string,
    notification: Omit<NotificationData, 'user_id' | 'foundation_id'>
  ): Promise<void> {
    // Get all foundation members
    const { data: members, error } = await supabase
      .from('foundation_members')
      .select('user_id')
      .eq('foundation_id', foundationId);

    if (error) {
      console.error('Failed to get foundation members for notification:', error);
      return;
    }

    // Send notification to all members
    for (const member of members || []) {
      await this.sendNotification({
        ...notification,
        user_id: member.user_id,
        foundation_id: foundationId
      });
    }
  }
}