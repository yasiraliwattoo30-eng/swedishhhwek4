import { supabase } from '../config/database';
import { AuditService } from '../services/AuditService';

interface MockUser {
  email: string;
  password: string;
  full_name: string;
  role: string;
}

const mockUsers: MockUser[] = [
  {
    email: 'admin@example.com',
    password: 'AdminPass123',
    full_name: 'System Administrator',
    role: 'admin'
  },
  {
    email: 'manager@example.com',
    password: 'ManagerPass123',
    full_name: 'Foundation Manager',
    role: 'foundation_owner'
  },
  {
    email: 'developer@example.com',
    password: 'DevPass123',
    full_name: 'Developer User',
    role: 'member'
  }
];

export class MockUserService {
  static async createMockUsers(): Promise<void> {
    console.log('🔧 Creating mock users for testing...');

    try {
      for (const mockUser of mockUsers) {
        await this.createUser(mockUser);
      }

      console.log('✅ Mock users created successfully');
      console.log('\n📧 Test Credentials:');
      mockUsers.forEach(user => {
        console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
      });
    } catch (error) {
      console.error('❌ Failed to create mock users:', error);
      throw error;
    }
  }

  private static async createUser(userData: MockUser): Promise<void> {
    console.log(`Creating ${userData.role} user: ${userData.email}`);

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userData.email)
      .single();

    if (existingUser) {
      console.log(`User ${userData.email} already exists, skipping...`);
      return;
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
        role: userData.role
      }
    });

    if (authError) {
      console.error(`Failed to create auth user for ${userData.email}:`, authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error(`Failed to create user ${userData.email}`);
    }

    // Create profile (should be automatic via trigger, but ensure it exists)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: userData.full_name,
        email: userData.email,
        role: userData.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error(`Failed to create profile for ${userData.email}:`, profileError);
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    // Get role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', userData.role)
      .single();

    if (roleError || !roleData) {
      console.error(`Role ${userData.role} not found`);
      return;
    }

    // Assign role to user
    const { error: roleAssignError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role_id: roleData.id,
        assigned_by: authData.user.id, // Self-assigned for mock users
        assigned_at: new Date().toISOString()
      });

    if (roleAssignError) {
      console.error(`Failed to assign role to ${userData.email}:`, roleAssignError);
    }

    // Create a foundation for the manager user
    if (userData.role === 'foundation_owner') {
      await this.createMockFoundation(authData.user.id, userData.full_name);
    }

    console.log(`✅ Created ${userData.role} user: ${userData.email}`);
  }

  private static async createMockFoundation(ownerId: string, ownerName: string): Promise<void> {
    const { data: foundation, error } = await supabase
      .from('foundations')
      .insert({
        name: 'Test Foundation',
        registration_number: 'TEST-2024-001',
        status: 'active',
        owner_user_id: ownerId,
        description: 'Test foundation for demonstration purposes',
        address: 'Stockholm, Sweden',
        phone: '+46 8 123 456 78',
        website: 'https://testfoundation.se',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create mock foundation:', error);
      return;
    }

    console.log(`✅ Created test foundation for ${ownerName}`);

    // Log audit trail
    await AuditService.log({
      user_id: ownerId,
      foundation_id: foundation.id,
      action: 'foundation_created',
      target_table: 'foundations',
      target_id: foundation.id,
      details: { 
        name: foundation.name,
        created_for_testing: true 
      }
    });
  }

  static async cleanupMockUsers(): Promise<void> {
    console.log('🧹 Cleaning up mock users...');

    try {
      for (const mockUser of mockUsers) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', mockUser.email)
          .single();

        if (profile) {
          // Delete auth user (this will cascade to profile and related data)
          await supabase.auth.admin.deleteUser(profile.id);
          console.log(`🗑️ Deleted user: ${mockUser.email}`);
        }
      }

      console.log('✅ Mock users cleanup completed');
    } catch (error) {
      console.error('❌ Failed to cleanup mock users:', error);
    }
  }

  static async listMockUsers(): Promise<void> {
    console.log('📋 Mock Users List:');
    console.log('==================');
    
    for (const user of mockUsers) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, role, created_at')
        .eq('email', user.email)
        .single();

      if (profile) {
        console.log(`✅ ${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
        console.log(`   Name: ${profile.full_name}`);
        console.log(`   ID: ${profile.id}`);
        console.log(`   Created: ${new Date(profile.created_at).toLocaleString()}`);
      } else {
        console.log(`❌ ${user.role.toUpperCase()}: ${user.email} (NOT FOUND)`);
      }
      console.log('');
    }
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'create':
      MockUserService.createMockUsers().then(() => {
        console.log('\n🎉 Mock users setup completed!');
        console.log('You can now test role-based access with these credentials.');
        process.exit(0);
      }).catch(error => {
        console.error('Mock user creation failed:', error);
        process.exit(1);
      });
      break;

    case 'cleanup':
      MockUserService.cleanupMockUsers().then(() => {
        console.log('Cleanup completed');
        process.exit(0);
      }).catch(error => {
        console.error('Cleanup failed:', error);
        process.exit(1);
      });
      break;

    case 'list':
      MockUserService.listMockUsers().then(() => {
        process.exit(0);
      }).catch(error => {
        console.error('Failed to list users:', error);
        process.exit(1);
      });
      break;

    default:
      console.log('Usage:');
      console.log('  npm run create-mock-users create');
      console.log('  npm run create-mock-users cleanup');
      console.log('  npm run create-mock-users list');
      process.exit(1);
  }
}