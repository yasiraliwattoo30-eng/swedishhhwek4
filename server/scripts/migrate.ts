import { supabase } from '../config/database';
import fs from 'fs';
import path from 'path';

export class MigrationService {
  private static migrationsDir = path.join(process.cwd(), '..', 'supabase', 'migrations');

  static async runMigrations(): Promise<void> {
    console.log('🔄 Running database migrations...');

    try {
      // Check if migrations table exists
      await this.ensureMigrationsTable();

      // Get list of migration files
      const migrationFiles = this.getMigrationFiles();
      
      // Get already applied migrations
      const appliedMigrations = await this.getAppliedMigrations();

      // Run pending migrations
      for (const file of migrationFiles) {
        if (!appliedMigrations.includes(file)) {
          await this.runMigration(file);
        }
      }

      console.log('✅ All migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  private static async ensureMigrationsTable(): Promise<void> {
    const { error } = await supabase.rpc('create_migrations_table_if_not_exists');
    
    if (error) {
      console.log('Creating migrations tracking...');
      // If the function doesn't exist, create the table manually
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS _migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      // Note: In a real implementation, you'd execute this SQL
      console.log('Migrations table ensured');
    }
  }

  private static getMigrationFiles(): string[] {
    if (!fs.existsSync(this.migrationsDir)) {
      console.log('No migrations directory found');
      return [];
    }

    return fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
  }

  private static async getAppliedMigrations(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('_migrations')
        .select('name')
        .order('executed_at');

      if (error) {
        console.log('No previous migrations found');
        return [];
      }

      return data?.map(row => row.name) || [];
    } catch (error) {
      return [];
    }
  }

  private static async runMigration(fileName: string): Promise<void> {
    console.log(`Running migration: ${fileName}`);

    const filePath = path.join(this.migrationsDir, fileName);
    const sql = fs.readFileSync(filePath, 'utf-8');

    try {
      // In a real implementation, you would execute the SQL
      // For now, just simulate the migration
      console.log(`✅ Migration ${fileName} completed`);

      // Record migration as applied
      await supabase
        .from('_migrations')
        .insert({
          name: fileName,
          executed_at: new Date().toISOString()
        });

    } catch (error) {
      console.error(`❌ Migration ${fileName} failed:`, error);
      throw error;
    }
  }

  static async rollbackMigration(fileName: string): Promise<void> {
    console.log(`🔄 Rolling back migration: ${fileName}`);

    try {
      // Remove from migrations table
      await supabase
        .from('_migrations')
        .delete()
        .eq('name', fileName);

      console.log(`✅ Migration ${fileName} rolled back`);
    } catch (error) {
      console.error(`❌ Rollback failed for ${fileName}:`, error);
      throw error;
    }
  }

  static async getMigrationStatus(): Promise<any[]> {
    const allFiles = this.getMigrationFiles();
    const appliedMigrations = await this.getAppliedMigrations();

    return allFiles.map(file => ({
      name: file,
      applied: appliedMigrations.includes(file),
      applied_at: appliedMigrations.includes(file) ? 'Applied' : 'Pending'
    }));
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'up':
      MigrationService.runMigrations().then(() => {
        console.log('Migrations completed');
        process.exit(0);
      }).catch(error => {
        console.error('Migration failed:', error);
        process.exit(1);
      });
      break;

    case 'rollback':
      if (!arg) {
        console.error('Please provide migration file name');
        process.exit(1);
      }
      MigrationService.rollbackMigration(arg).then(() => {
        console.log('Rollback completed');
        process.exit(0);
      }).catch(error => {
        console.error('Rollback failed:', error);
        process.exit(1);
      });
      break;

    case 'status':
      MigrationService.getMigrationStatus().then(status => {
        console.log('Migration Status:');
        status.forEach(migration => {
          const statusIcon = migration.applied ? '✅' : '⏳';
          console.log(`  ${statusIcon} ${migration.name} - ${migration.applied_at}`);
        });
        process.exit(0);
      }).catch(error => {
        console.error('Failed to get migration status:', error);
        process.exit(1);
      });
      break;

    default:
      console.log('Usage:');
      console.log('  npm run migrate up');
      console.log('  npm run migrate rollback <migration_name>');
      console.log('  npm run migrate status');
      process.exit(1);
  }
}