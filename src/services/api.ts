import { supabase } from './supabase';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface Account {
  id: string;
  foundation_id: string;
  account_number: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  foundation_id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  total_debit: number;
  total_credit: number;
  status: 'draft' | 'posted' | 'reversed';
  created_by: string;
  created_at: string;
  updated_at: string;
  line_items?: JournalEntryLine[];
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  account_name?: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  line_order: number;
}

export interface CreateJournalEntryData {
  foundation_id: string;
  entry_date: string;
  description: string;
  line_items: {
    account_id: string;
    description: string;
    debit_amount: number;
    credit_amount: number;
  }[];
}

export interface CreateAccountData {
  foundation_id: string;
  account_number: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  currency: string;
}

export interface UpdateProfileData {
  full_name?: string;
  avatar_url?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface FoundationRegistrationData {
  foundation_name: string;
  purpose: string;
  registered_office_address: string;
  postal_code: string;
  city: string;
  initial_capital: number;
  board_members: BoardMemberData[];
  contact_person: ContactPersonData;
}

export interface BoardMemberData {
  first_name: string;
  last_name: string;
  personal_number: string;
  email: string;
  phone?: string;
  address: string;
  role: 'chairman' | 'vice_chairman' | 'secretary' | 'treasurer' | 'member';
  is_signatory: boolean;
}

export interface ContactPersonData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  is_authorized_representative: boolean;
}

class ApiService {
  private async handleResponse<T>(response: any): Promise<ApiResponse<T>> {
    if (response.error) {
      return { success: false, error: response.error.message };
    }
    return { success: true, data: response.data };
  }

  // Account Management
  async getAccounts(foundationId?: string): Promise<ApiResponse<Account[]>> {
    let query = supabase
      .from('accounts')
      .select('*')
      .order('account_number');

    if (foundationId) {
      query = query.eq('foundation_id', foundationId);
    }

    const response = await query;
    return this.handleResponse(response);
  }

  async createAccount(accountData: CreateAccountData): Promise<ApiResponse<Account>> {
    const response = await supabase
      .from('accounts')
      .insert({
        ...accountData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    return this.handleResponse(response);
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<ApiResponse<Account>> {
    const response = await supabase
      .from('accounts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    return this.handleResponse(response);
  }

  async deleteAccount(id: string): Promise<ApiResponse<void>> {
    const response = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    return this.handleResponse(response);
  }

  // Journal Entry Management
  async getJournalEntries(foundationId?: string): Promise<ApiResponse<JournalEntry[]>> {
    let query = supabase
      .from('journal_entries')
      .select(`
        *,
        journal_entry_lines(
          *,
          accounts(account_name)
        )
      `)
      .order('entry_date', { ascending: false });

    if (foundationId) {
      query = query.eq('foundation_id', foundationId);
    }

    const response = await query;
    
    if (response.error) {
      return this.handleResponse(response);
    }

    // Transform the data to include account names in line items
    const transformedData = response.data?.map(entry => ({
      ...entry,
      line_items: entry.journal_entry_lines?.map((line: any) => ({
        ...line,
        account_name: line.accounts?.account_name
      }))
    }));

    return { success: true, data: transformedData };
  }

  async createJournalEntry(entryData: CreateJournalEntryData): Promise<ApiResponse<JournalEntry>> {
    // Generate entry number
    const entryNumber = `JE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    // Calculate totals
    const totalDebit = entryData.line_items.reduce((sum, item) => sum + item.debit_amount, 0);
    const totalCredit = entryData.line_items.reduce((sum, item) => sum + item.credit_amount, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return { success: false, error: 'Journal entry must be balanced (debits must equal credits)' };
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Create journal entry
    const { data: entry, error: entryError } = await supabase
      .from('journal_entries')
      .insert({
        foundation_id: entryData.foundation_id,
        entry_number: entryNumber,
        entry_date: entryData.entry_date,
        description: entryData.description,
        total_debit: totalDebit,
        total_credit: totalCredit,
        status: 'draft',
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (entryError) {
      return { success: false, error: entryError.message };
    }

    // Create line items
    const lineItemsWithEntryId = entryData.line_items.map((item, index) => ({
      journal_entry_id: entry.id,
      account_id: item.account_id,
      description: item.description,
      debit_amount: item.debit_amount,
      credit_amount: item.credit_amount,
      line_order: index + 1
    }));

    const { error: lineItemsError } = await supabase
      .from('journal_entry_lines')
      .insert(lineItemsWithEntryId);

    if (lineItemsError) {
      // Clean up entry if line items fail
      await supabase.from('journal_entries').delete().eq('id', entry.id);
      return { success: false, error: lineItemsError.message };
    }

    return { success: true, data: entry };
  }

  async updateJournalEntry(id: string, updates: Partial<JournalEntry>): Promise<ApiResponse<JournalEntry>> {
    const response = await supabase
      .from('journal_entries')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    return this.handleResponse(response);
  }

  async deleteJournalEntry(id: string): Promise<ApiResponse<void>> {
    const response = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);

    return this.handleResponse(response);
  }

  // Expense Management
  async getExpenses(foundationId?: string): Promise<ApiResponse<any[]>> {
    let query = supabase
      .from('expenses')
      .select(`
        *,
        foundations(name),
        profiles!expenses_user_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (foundationId) {
      query = query.eq('foundation_id', foundationId);
    }

    const response = await query;
    return this.handleResponse(response);
  }

  async createExpense(expenseData: any): Promise<ApiResponse<any>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const response = await supabase
      .from('expenses')
      .insert({
        ...expenseData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    return this.handleResponse(response);
  }

  async updateExpense(id: string, updates: any): Promise<ApiResponse<any>> {
    const response = await supabase
      .from('expenses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    return this.handleResponse(response);
  }

  async deleteExpense(id: string): Promise<ApiResponse<void>> {
    const response = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    return this.handleResponse(response);
  }

  // Profile Management
  async getCurrentProfile(): Promise<ApiResponse<any>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const response = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return this.handleResponse(response);
  }

  async updateProfile(updates: UpdateProfileData): Promise<ApiResponse<any>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const response = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    return this.handleResponse(response);
  }

  async changePassword(passwordData: ChangePasswordData): Promise<ApiResponse<void>> {
    const { error } = await supabase.auth.updateUser({
      password: passwordData.new_password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  // Foundation Registration
  async registerFoundation(registrationData: FoundationRegistrationData): Promise<ApiResponse<any>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Create foundation
    const { data: foundation, error: foundationError } = await supabase
      .from('foundations')
      .insert({
        name: registrationData.foundation_name,
        description: registrationData.purpose,
        address: `${registrationData.registered_office_address}, ${registrationData.postal_code} ${registrationData.city}`,
        owner_user_id: user.id,
        status: 'pending_verification',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (foundationError) {
      return { success: false, error: foundationError.message };
    }

    return { success: true, data: foundation };
  }

  // Meeting Management
  async getMeetings(foundationId?: string): Promise<ApiResponse<any[]>> {
    let query = supabase
      .from('meetings')
      .select(`
        *,
        foundations(name),
        profiles!meetings_organizer_id_fkey(full_name, email)
      `)
      .order('start_time', { ascending: false });

    if (foundationId) {
      query = query.eq('foundation_id', foundationId);
    }

    const response = await query;
    return this.handleResponse(response);
  }

  async createMeeting(meetingData: any): Promise<ApiResponse<any>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const response = await supabase
      .from('meetings')
      .insert({
        ...meetingData,
        organizer_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    return this.handleResponse(response);
  }

  async updateMeeting(id: string, updates: any): Promise<ApiResponse<any>> {
    const response = await supabase
      .from('meetings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    return this.handleResponse(response);
  }

  async deleteMeeting(id: string): Promise<ApiResponse<void>> {
    const response = await supabase
      .from('meetings')
      .delete()
      .eq('id', id);

    return this.handleResponse(response);
  }

  // Foundation Management
  async getFoundations(): Promise<ApiResponse<any[]>> {
    const response = await supabase
      .from('foundations')
      .select(`
        *,
        foundation_members!inner(role, permissions)
      `)
      .order('created_at', { ascending: false });

    return this.handleResponse(response);
  }

  async getFoundationById(id: string): Promise<ApiResponse<any>> {
    const response = await supabase
      .from('foundations')
      .select(`
        *,
        foundation_members(
          user_id,
          role,
          permissions,
          joined_at,
          profiles(full_name, email, avatar_url)
        )
      `)
      .eq('id', id)
      .single();

    return this.handleResponse(response);
  }

  async createFoundation(foundationData: any): Promise<ApiResponse<any>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const response = await supabase
      .from('foundations')
      .insert({
        ...foundationData,
        owner_user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    return this.handleResponse(response);
  }

  async updateFoundation(id: string, updates: any): Promise<ApiResponse<any>> {
    const response = await supabase
      .from('foundations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    return this.handleResponse(response);
  }

  async deleteFoundation(id: string): Promise<ApiResponse<void>> {
    const response = await supabase
      .from('foundations')
      .delete()
      .eq('id', id);

    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();