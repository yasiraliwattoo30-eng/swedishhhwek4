import { supabase } from '../config/database';
import { ComplianceItem } from '../types/governance';
import { EmailService } from './EmailService';

export class ComplianceService {
  static async checkUpcomingDeadlines(): Promise<ComplianceItem[]> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data: items, error } = await supabase
      .from('compliance_items')
      .select(`
        *,
        profiles!compliance_items_assigned_to_fkey(email, full_name)
      `)
      .lte('due_date', thirtyDaysFromNow.toISOString().split('T')[0])
      .neq('status', 'completed')
      .order('due_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch compliance items: ${error.message}`);
    }

    return items || [];
  }

  static async sendComplianceReminders(): Promise<void> {
    const upcomingItems = await this.checkUpcomingDeadlines();

    for (const item of upcomingItems) {
      const dueDate = new Date(item.due_date);
      const today = new Date();
      const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Send reminders at 30, 14, 7, 3, and 1 days before due date
      if ([30, 14, 7, 3, 1].includes(daysRemaining)) {
        const assignee = (item as any).profiles;
        if (assignee?.email) {
          await EmailService.sendComplianceReminderEmail(
            assignee.email,
            item.title,
            item.due_date,
            daysRemaining
          );
        }
      }
    }
  }

  static async markOverdueItems(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('compliance_items')
      .update({ status: 'overdue' })
      .lt('due_date', today)
      .neq('status', 'completed');

    if (error) {
      console.error('Failed to mark overdue compliance items:', error);
    }
  }

  static async generateComplianceReport(foundationId: string): Promise<Record<string, any>> {
    const { data: items, error } = await supabase
      .from('compliance_items')
      .select('*')
      .eq('foundation_id', foundationId);

    if (error) {
      throw new Error(`Failed to fetch compliance items: ${error.message}`);
    }

    const report = {
      foundation_id: foundationId,
      generated_at: new Date().toISOString(),
      summary: {
        total_items: items?.length || 0,
        completed: items?.filter(item => item.status === 'completed').length || 0,
        in_progress: items?.filter(item => item.status === 'in_progress').length || 0,
        overdue: items?.filter(item => item.status === 'overdue').length || 0,
        pending: items?.filter(item => item.status === 'pending').length || 0
      },
      by_regulation: {
        lansstyrelsen: items?.filter(item => item.regulation_type === 'lansstyrelsen').length || 0,
        skatteverket: items?.filter(item => item.regulation_type === 'skatteverket').length || 0,
        bolagsverket: items?.filter(item => item.regulation_type === 'bolagsverket').length || 0,
        other: items?.filter(item => item.regulation_type === 'other').length || 0
      },
      by_priority: {
        critical: items?.filter(item => item.priority === 'critical').length || 0,
        high: items?.filter(item => item.priority === 'high').length || 0,
        medium: items?.filter(item => item.priority === 'medium').length || 0,
        low: items?.filter(item => item.priority === 'low').length || 0
      },
      upcoming_deadlines: items?.filter(item => {
        const dueDate = new Date(item.due_date);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return dueDate <= thirtyDaysFromNow && item.status !== 'completed';
      }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()) || []
    };

    return report;
  }

  static async validateComplianceRequirement(
    foundationId: string,
    requirementType: string,
    data: Record<string, any>
  ): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    switch (requirementType) {
      case 'annual_report':
        if (!data.financial_statement) {
          issues.push('Financial statement is required');
        }
        if (!data.activity_report) {
          issues.push('Activity report is required');
        }
        if (!data.board_resolution) {
          issues.push('Board resolution approving the report is required');
        }
        break;

      case 'tax_filing':
        if (!data.income_statement) {
          issues.push('Income statement is required');
        }
        if (!data.expense_records) {
          issues.push('Detailed expense records are required');
        }
        if (!data.donation_records) {
          issues.push('Donation records are required');
        }
        break;

      case 'board_registration':
        if (!data.board_members || data.board_members.length < 3) {
          issues.push('Minimum 3 board members required');
        }
        if (!data.chairman_appointed) {
          issues.push('Board chairman must be appointed');
        }
        break;

      default:
        issues.push('Unknown compliance requirement type');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  static async scheduleComplianceReminders(): Promise<void> {
    // This would be called by a cron job or scheduled task
    try {
      await this.markOverdueItems();
      await this.sendComplianceReminders();
      console.log('Compliance reminders processed successfully');
    } catch (error) {
      console.error('Failed to process compliance reminders:', error);
    }
  }
}