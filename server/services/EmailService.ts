import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export class EmailService {
  private static transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  static async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', options.to);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Email sending failed');
    }
  }

  static async sendWelcomeEmail(email: string, fullName: string): Promise<void> {
    const html = `
      <h1>Welcome to Foundation Management System</h1>
      <p>Dear ${fullName},</p>
      <p>Welcome to the Swedish Foundation Management System. Your account has been created successfully.</p>
      <p>You can now log in and start managing your foundation operations.</p>
      <p>Best regards,<br>Foundation Management Team</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to Foundation Management System',
      html
    });
  }

  static async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <h1>Password Reset Request</h1>
      <p>You have requested to reset your password.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html
    });
  }

  static async sendDocumentApprovalEmail(
    email: string, 
    documentName: string, 
    approved: boolean,
    foundationName: string
  ): Promise<void> {
    const status = approved ? 'approved' : 'rejected';
    const html = `
      <h1>Document ${approved ? 'Approved' : 'Rejected'}</h1>
      <p>Your document "${documentName}" for ${foundationName} has been ${status}.</p>
      ${approved 
        ? '<p>You can now proceed with the next steps in your foundation management process.</p>'
        : '<p>Please review the feedback and resubmit if necessary.</p>'
      }
      <p>Best regards,<br>Foundation Management Team</p>
    `;

    await this.sendEmail({
      to: email,
      subject: `Document ${approved ? 'Approved' : 'Rejected'} - ${documentName}`,
      html
    });
  }

  static async sendMeetingInvitation(
    emails: string[],
    meetingTitle: string,
    meetingDate: string,
    location?: string,
    meetingUrl?: string
  ): Promise<void> {
    const html = `
      <h1>Meeting Invitation</h1>
      <p>You are invited to attend: <strong>${meetingTitle}</strong></p>
      <p><strong>Date:</strong> ${new Date(meetingDate).toLocaleString()}</p>
      ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
      ${meetingUrl ? `<p><strong>Meeting URL:</strong> <a href="${meetingUrl}">${meetingUrl}</a></p>` : ''}
      <p>Please confirm your attendance.</p>
      <p>Best regards,<br>Foundation Management Team</p>
    `;

    await this.sendEmail({
      to: emails,
      subject: `Meeting Invitation: ${meetingTitle}`,
      html
    });
  }

  static async sendExpenseStatusEmail(
    email: string,
    expenseDescription: string,
    amount: number,
    currency: string,
    approved: boolean,
    rejectionReason?: string
  ): Promise<void> {
    const status = approved ? 'approved' : 'rejected';
    const html = `
      <h1>Expense ${approved ? 'Approved' : 'Rejected'}</h1>
      <p>Your expense submission has been ${status}:</p>
      <ul>
        <li><strong>Description:</strong> ${expenseDescription}</li>
        <li><strong>Amount:</strong> ${amount.toLocaleString()} ${currency}</li>
      </ul>
      ${!approved && rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
      <p>Best regards,<br>Foundation Management Team</p>
    `;

    await this.sendEmail({
      to: email,
      subject: `Expense ${approved ? 'Approved' : 'Rejected'}`,
      html
    });
  }

  static async sendComplianceReminderEmail(
    email: string,
    complianceTitle: string,
    dueDate: string,
    daysRemaining: number
  ): Promise<void> {
    const urgency = daysRemaining <= 3 ? 'URGENT' : daysRemaining <= 7 ? 'Important' : 'Reminder';
    
    const html = `
      <h1>${urgency}: Compliance Deadline Approaching</h1>
      <p>This is a reminder that the following compliance requirement is due soon:</p>
      <ul>
        <li><strong>Requirement:</strong> ${complianceTitle}</li>
        <li><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</li>
        <li><strong>Days Remaining:</strong> ${daysRemaining}</li>
      </ul>
      <p>Please ensure this requirement is completed before the deadline.</p>
      <p>Best regards,<br>Foundation Management Team</p>
    `;

    await this.sendEmail({
      to: email,
      subject: `${urgency}: Compliance Due - ${complianceTitle}`,
      html
    });
  }
}