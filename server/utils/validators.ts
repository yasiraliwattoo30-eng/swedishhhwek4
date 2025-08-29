import { VALIDATION_RULES } from './constants';

export class Validators {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): boolean {
    return password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH;
  }

  static isValidSwedishPersonalNumber(personalNumber: string): boolean {
    if (!VALIDATION_RULES.PERSONAL_NUMBER_REGEX.test(personalNumber)) {
      return false;
    }

    const [datePart] = personalNumber.split('-');
    if (!datePart) {
      return false;
    }
    const year = parseInt(datePart.substring(0, 4));
    const month = parseInt(datePart.substring(4, 6));
    const day = parseInt(datePart.substring(6, 8));

    // Basic date validation
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;

    return true;
  }

  static isValidSwedishPhoneNumber(phone: string): boolean {
    return VALIDATION_RULES.PHONE_NUMBER_REGEX.test(phone);
  }

  static isValidSwedishOrganizationNumber(orgNumber: string): boolean {
    return VALIDATION_RULES.ORGANIZATION_NUMBER_REGEX.test(orgNumber);
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidCurrency(currency: string): boolean {
    const validCurrencies = ['SEK', 'EUR', 'USD', 'NOK', 'DKK'];
    return validCurrencies.includes(currency);
  }

  static isValidAmount(amount: number): boolean {
    return amount > 0 && Number.isFinite(amount);
  }

  static isValidDateRange(startDate: string, endDate: string): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  }

  static isValidPercentage(value: number): boolean {
    return value >= 0 && value <= 100;
  }

  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  static validateFileType(mimetype: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimetype);
  }

  static validateFileSize(size: number, maxSize: number): boolean {
    return size <= maxSize;
  }

  static isValidAccountNumber(accountNumber: string, bankName: string): boolean {
    // Swedish bank account number validation
    switch (bankName.toLowerCase()) {
      case 'swedbank':
        return /^\d{4}-\d{1},\d{3}\s\d{3}\s\d{3}-\d{1}$/.test(accountNumber);
      case 'handelsbanken':
        return /^\d{4},\d{3}\s\d{3}\s\d{3}$/.test(accountNumber);
      case 'seb':
        return /^\d{4}\s\d{2}\s\d{3}\s\d{1}$/.test(accountNumber);
      default:
        return accountNumber.length >= 8; // Generic validation
    }
  }

  static isValidIBAN(iban: string): boolean {
    // Basic IBAN validation for Swedish accounts
    const swedishIBANRegex = /^SE\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{2}$/;
    return swedishIBANRegex.test(iban.replace(/\s/g, ''));
  }

  static validateBusinessHours(time: string): boolean {
    const hour = new Date(`2000-01-01T${time}`).getHours();
    return hour >= 8 && hour <= 18; // 8 AM to 6 PM
  }

  static validateMeetingDuration(startTime: string, endTime: string): boolean {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    return durationHours > 0 && durationHours <= 8; // Max 8 hours
  }

  static validateBudgetAmount(amount: number, foundationAssets: number): boolean {
    // Budget should not exceed 50% of foundation assets
    return amount <= foundationAssets * 0.5;
  }

  static validateTaxRate(rate: number): boolean {
    return rate >= 0 && rate <= 100;
  }

  static validateEmployeeNumber(employeeNumber: string): boolean {
    return /^EMP-\d{3,6}$/.test(employeeNumber);
  }

  static validateInvoiceNumber(invoiceNumber: string): boolean {
    return /^(INV|SI)-\d{4}-\d{6}$/.test(invoiceNumber);
  }

  static validateJournalEntryNumber(entryNumber: string): boolean {
    return /^JE-\d{4}-\d{6}$/.test(entryNumber);
  }
}