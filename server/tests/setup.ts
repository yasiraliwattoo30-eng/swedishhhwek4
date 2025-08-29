import { supabase } from '../config/database';

export class TestSetup {
  static async setupTestDatabase(): Promise<void> {
    console.log('🧪 Setting up test database...');

    try {
      // Create test user
      const testUser = await this.createTestUser();
      
      // Create test foundation
      const testFoundation = await this.createTestFoundation(testUser.id);
      
      // Create test data
      await this.createTestDocuments(testFoundation.id, testUser.id);
      await this.createTestMeetings(testFoundation.id, testUser.id);
      await this.createTestExpenses(testFoundation.id, testUser.id);

      console.log('✅ Test database setup completed');
    } catch (error) {
      console.error('❌ Test database setup failed:', error);
      throw error;
    }
  }

  static async cleanupTestDatabase(): Promise<void> {
    console.log('🧹 Cleaning up test database...');

    try {
      // Delete test data in reverse dependency order
      await supabase.from('expenses').delete().like('description', '%TEST%');
      await supabase.from('meetings').delete().like('title', '%TEST%');
      await supabase.from('documents').delete().like('file_name', '%TEST%');
      await supabase.from('foundation_members').delete().eq('foundation_id', 'test-foundation-id');
      await supabase.from('foundations').delete().like('name', '%TEST%');
      
      // Delete test users
      const { data: testUsers } = await supabase
        .from('profiles')
        .select('id')
        .like('email', '%test%');

      if (testUsers) {
        for (const user of testUsers) {
          await supabase.auth.admin.deleteUser(user.id);
        }
      }

      console.log('✅ Test database cleanup completed');
    } catch (error) {
      console.error('❌ Test database cleanup failed:', error);
    }
  }

  private static async createTestUser(): Promise<any> {
    const testEmail = `test-${Date.now()}@foundation.se`;
    const testPassword = 'testpassword123';

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'TEST User'
      }
    });

    if (authError) {
      throw authError;
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: 'TEST User',
        email: testEmail,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      throw profileError;
    }

    return authData.user;
  }

  private static async createTestFoundation(ownerId: string): Promise<any> {
    const foundation = {
      name: 'TEST Foundation',
      registration_number: 'TEST-2024-001',
      status: 'active',
      owner_user_id: ownerId,
      description: 'TEST foundation for automated testing',
      address: 'TEST Address, Stockholm, Sweden',
      phone: '+46 8 123 456 78',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('foundations')
      .insert(foundation)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  private static async createTestDocuments(foundationId: string, userId: string): Promise<void> {
    const documents = [
      {
        foundation_id: foundationId,
        uploaded_by: userId,
        document_type: 'articles_of_association',
        file_name: 'TEST_Articles_of_Association.pdf',
        file_path: `/test/documents/${foundationId}/articles.pdf`,
        file_size: 1024000,
        mime_type: 'application/pdf',
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const { error } = await supabase.from('documents').insert(documents);
    if (error) {
      throw error;
    }
  }

  private static async createTestMeetings(foundationId: string, organizerId: string): Promise<void> {
    const meetings = [
      {
        foundation_id: foundationId,
        organizer_id: organizerId,
        title: 'TEST Board Meeting',
        description: 'TEST meeting for automated testing',
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
        location: 'TEST Location',
        meeting_type: 'board_meeting',
        status: 'scheduled',
        attendees: [organizerId],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const { error } = await supabase.from('meetings').insert(meetings);
    if (error) {
      throw error;
    }
  }

  private static async createTestExpenses(foundationId: string, userId: string): Promise<void> {
    const expenses = [
      {
        foundation_id: foundationId,
        user_id: userId,
        amount: 1000.00,
        currency: 'SEK',
        category: 'office_supplies',
        description: 'TEST office supplies expense',
        expense_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const { error } = await supabase.from('expenses').insert(expenses);
    if (error) {
      throw error;
    }
  }
}

// Export for use in tests
export default TestSetup;