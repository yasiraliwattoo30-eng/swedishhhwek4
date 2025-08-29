import { Response } from 'express';
import { supabase } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export class ExpenseController {
  static getExpenses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { foundation_id, status, category } = req.query;

    let query = supabase
      .from('expenses')
      .select(`
        *,
        foundations(name),
        profiles!expenses_user_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (foundation_id) {
      query = query.eq('foundation_id', foundation_id);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data: expenses, error } = await query;

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({
      expenses: expenses || [],
      total: expenses?.length || 0
    });
  });

  static getExpenseById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const { data: expense, error } = await supabase
      .from('expenses')
      .select(`
        *,
        foundations(name),
        profiles!expenses_user_id_fkey(full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw createError('Expense not found', 404);
    }

    res.json({ expense });
  });

  static createExpense = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      foundation_id,
      amount,
      currency,
      category,
      description,
      expense_date
    } = req.body;
    const file = req.file;

    let receiptUrl = null;

    // Upload receipt if provided
    if (file) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = `receipts/${foundation_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (uploadError) {
        throw createError('Receipt upload failed', 500);
      }

      receiptUrl = filePath;
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({
        foundation_id,
        user_id: req.user?.id,
        amount: parseFloat(amount),
        currency,
        category,
        description,
        receipt_url: receiptUrl,
        expense_date,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      // Clean up uploaded receipt if expense creation fails
      if (receiptUrl) {
        await supabase.storage.from('receipts').remove([receiptUrl]);
      }
      throw createError(error.message, 400);
    }

    res.status(201).json({
      message: 'Expense created successfully',
      expense
    });
  });

  static updateExpense = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const {
      amount,
      category,
      description,
      expense_date,
      status,
      rejection_reason
    } = req.body;

    const { data: expense, error } = await supabase
      .from('expenses')
      .update({
        amount: amount ? parseFloat(amount) : undefined,
        category,
        description,
        expense_date,
        status,
        rejection_reason,
        approved_by: status === 'approved' ? req.user?.id : null,
        approved_at: status === 'approved' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({
      message: 'Expense updated successfully',
      expense
    });
  });

  static deleteExpense = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    // Get expense to find receipt path
    const { data: expense, error: fetchError } = await supabase
      .from('expenses')
      .select('receipt_url')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw createError('Expense not found', 404);
    }

    // Delete receipt if exists
    if (expense.receipt_url) {
      await supabase.storage
        .from('receipts')
        .remove([expense.receipt_url]);
    }

    // Delete expense record
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({ message: 'Expense deleted successfully' });
  });

  static approveExpense = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const { data: expense, error } = await supabase
      .from('expenses')
      .update({
        status: 'approved',
        approved_by: req.user?.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({
      message: 'Expense approved successfully',
      expense
    });
  });

  static rejectExpense = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    const { data: expense, error } = await supabase
      .from('expenses')
      .update({
        status: 'rejected',
        rejection_reason,
        approved_by: req.user?.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({
      message: 'Expense rejected successfully',
      expense
    });
  });

  static downloadReceipt = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    // Get expense
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .select('receipt_url, description')
      .eq('id', id)
      .single();

    if (expenseError) {
      throw createError('Expense not found', 404);
    }

    if (!expense.receipt_url) {
      throw createError('No receipt available', 404);
    }

    // Get signed URL for download
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from('receipts')
      .createSignedUrl(expense.receipt_url, 3600); // 1 hour expiry

    if (urlError) {
      throw createError('Failed to generate download URL', 500);
    }

    res.json({
      download_url: signedUrl.signedUrl,
      description: expense.description
    });
  });
}