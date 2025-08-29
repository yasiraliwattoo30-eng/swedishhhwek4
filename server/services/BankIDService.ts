import crypto from 'crypto';
import { supabase } from '../config/database';
import { BankIDSession, BankIDCompletionData } from '../types/governance';

export class BankIDService {
  private static readonly BANKID_ENDPOINT = process.env.BANKID_ENDPOINT || 'https://appapi2.test.bankid.com/rp/v5.1/';

  static async initiateAuthentication(personalNumber: string, userId: string): Promise<BankIDSession> {
    const sessionId = crypto.randomUUID();
    const orderRef = `order_${Date.now()}`;
    const autoStartToken = crypto.randomBytes(16).toString('hex');

    // In a real implementation, this would call the actual BankID API
    const session: Omit<BankIDSession, 'id'> = {
      user_id: userId,
      session_id: sessionId,
      personal_number: personalNumber,
      authentication_type: 'auth',
      status: 'pending',
      order_ref: orderRef,
      auto_start_token: autoStartToken,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('bankid_sessions')
      .insert(session)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create BankID session: ${error.message}`);
    }

    return data;
  }

  static async initiateSignature(personalNumber: string, userId: string, documentId: string): Promise<BankIDSession> {
    const sessionId = crypto.randomUUID();
    const orderRef = `sign_${Date.now()}`;
    const autoStartToken = crypto.randomBytes(16).toString('hex');

    const session: Omit<BankIDSession, 'id'> = {
      user_id: userId,
      session_id: sessionId,
      personal_number: personalNumber,
      authentication_type: 'sign',
      status: 'pending',
      order_ref: orderRef,
      auto_start_token: autoStartToken,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('bankid_sessions')
      .insert(session)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create BankID signing session: ${error.message}`);
    }

    return data;
  }

  static async checkStatus(orderRef: string): Promise<BankIDSession | null> {
    const { data, error } = await supabase
      .from('bankid_sessions')
      .select('*')
      .eq('order_ref', orderRef)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  static async completeSession(
    orderRef: string, 
    completionData: BankIDCompletionData
  ): Promise<BankIDSession> {
    const { data, error } = await supabase
      .from('bankid_sessions')
      .update({
        status: 'completed',
        completion_data: completionData,
        completed_at: new Date().toISOString()
      })
      .eq('order_ref', orderRef)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to complete BankID session: ${error.message}`);
    }

    return data;
  }

  static async failSession(orderRef: string, reason: string): Promise<void> {
    await supabase
      .from('bankid_sessions')
      .update({
        status: 'failed',
        completion_data: { error: reason },
        completed_at: new Date().toISOString()
      })
      .eq('order_ref', orderRef);
  }

  static async cancelSession(orderRef: string): Promise<void> {
    await supabase
      .from('bankid_sessions')
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString()
      })
      .eq('order_ref', orderRef);
  }

  static validatePersonalNumber(personalNumber: string): boolean {
    const regex = /^(\d{8})-(\d{4})$/;
    if (!regex.test(personalNumber)) return false;

    const [datePart] = personalNumber.split('-');
    if (!datePart) return false;
    const year = parseInt(datePart.substring(0, 4));
    const month = parseInt(datePart.substring(4, 6));
    const day = parseInt(datePart.substring(6, 8));

    // Basic date validation
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;

    return true;
  }

  static generateDigitalSignature(data: string, privateKey: string): string {
    // In a real implementation, this would use proper cryptographic signing
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return `signature_${hash}`;
  }

  static verifyDigitalSignature(data: string, signature: string, publicKey: string): boolean {
    // In a real implementation, this would verify the signature
    const expectedSignature = this.generateDigitalSignature(data, 'mock_private_key');
    return signature === expectedSignature;
  }
}