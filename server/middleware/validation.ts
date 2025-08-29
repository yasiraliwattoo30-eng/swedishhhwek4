import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {

    const errorMessages = errors.array().map((error: ValidationError) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));

    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errorMessages
    });
  }
  
  next();
  return;
};

export const validateUUID = (value: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateSwedishPersonalNumber = (personalNumber: string): boolean => {
  const regex = /^(\d{8})-(\d{4})$/;
  return regex.test(personalNumber);
};

export const validateSwedishPhoneNumber = (phone: string): boolean => {
  const regex = /^\+46\s?[1-9]\d{1,2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
  return regex.test(phone);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};