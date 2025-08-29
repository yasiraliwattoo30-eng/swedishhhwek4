import crypto from 'crypto';

export class Helpers {
  static generateId(): string {
    return crypto.randomUUID();
  }

  static generateReference(prefix: string = 'REF'): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp.slice(-6)}-${random}`;
  }

  static formatCurrency(amount: number, currency: string = 'SEK'): string {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency
    }).format(amount);
  }

  static formatDate(date: string | Date, locale: string = 'sv-SE'): string {
    return new Date(date).toLocaleDateString(locale);
  }

  static formatDateTime(date: string | Date, locale: string = 'sv-SE'): string {
    return new Date(date).toLocaleString(locale);
  }

  static calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100 * 100) / 100; // Round to 2 decimal places
  }

  static validateSwedishPersonalNumber(personalNumber: string): boolean {
    const regex = /^(\d{8})-(\d{4})$/;
    if (!regex.test(personalNumber)) return false;

    const [datePart, lastFour] = personalNumber.split('-');
    const year = parseInt(datePart.substring(0, 4));
    const month = parseInt(datePart.substring(4, 6));
    const day = parseInt(datePart.substring(6, 8));

    // Basic date validation
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;

    return true;
  }

  static validateSwedishOrganizationNumber(orgNumber: string): boolean {
    const regex = /^(\d{6})-(\d{4})$/;
    return regex.test(orgNumber);
  }

  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  static generateInvoiceNumber(year?: number): string {
    const currentYear = year || new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${currentYear}-${timestamp}`;
  }

  static generateJournalEntryNumber(year?: number): string {
    const currentYear = year || new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `JE-${currentYear}-${timestamp}`;
  }

  static calculateTax(amount: number, taxRate: number): number {
    return Math.round(amount * (taxRate / 100) * 100) / 100;
  }

  static calculateNetAmount(grossAmount: number, taxRate: number): number {
    const tax = this.calculateTax(grossAmount, taxRate);
    return grossAmount + tax;
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static maskPersonalNumber(personalNumber: string): string {
    return personalNumber.replace(/(\d{8})-(\d{4})/, '$1-****');
  }

  static maskBankAccount(accountNumber: string): string {
    if (accountNumber.length <= 4) return accountNumber;
    const visiblePart = accountNumber.slice(-4);
    const maskedPart = '*'.repeat(accountNumber.length - 4);
    return maskedPart + visiblePart;
  }

  static getDaysBetween(startDate: string | Date, endDate: string | Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static isDateInRange(date: string | Date, startDate: string | Date, endDate: string | Date): boolean {
    const checkDate = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return checkDate >= start && checkDate <= end;
  }

  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  static comparePasswords(password: string, hashedPassword: string): boolean {
    const hashedInput = this.hashPassword(password);
    return hashedInput === hashedPassword;
  }
}