import { supabase } from '../config/database';
import fs from 'fs';
import path from 'path';

export class BackupService {
  private static backupDir = path.join(process.cwd(), 'backups');

  static async createBackup(foundationId?: string): Promise<string> {
    console.log('📦 Creating database backup...');

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = foundationId 
      ? `foundation-${foundationId}-backup-${timestamp}.json`
      : `full-backup-${timestamp}.json`;
    const backupPath = path.join(this.backupDir, backupFileName);

    try {
      const backupData: any = {};

      // Tables to backup
      const tables = [
        'profiles',
        'foundations',
        'foundation_members',
        'documents',
        'document_versions',
        'meetings',
        'meeting_minutes',
        'expenses',
        'investments',
        'projects',
        'grants',
        'audit_logs'
      ];

      for (const table of tables) {
        console.log(`Backing up table: ${table}`);
        
        let query = supabase.from(table).select('*');
        
        // Filter by foundation if specified
        if (foundationId && ['documents', 'meetings', 'expenses', 'investments', 'projects'].includes(table)) {
          query = query.eq('foundation_id', foundationId);
        } else if (foundationId && table === 'foundation_members') {
          query = query.eq('foundation_id', foundationId);
        } else if (foundationId && table === 'foundations') {
          query = query.eq('id', foundationId);
        } else if (foundationId && table === 'grants') {
          // Get grants for projects in this foundation
          const { data: projects } = await supabase
            .from('projects')
            .select('id')
            .eq('foundation_id', foundationId);
          
          if (projects && projects.length > 0) {
            const projectIds = projects.map(p => p.id);
            query = query.in('project_id', projectIds);
          } else {
            backupData[table] = [];
            continue;
          }
        }

        const { data, error } = await query;
        
        if (error) {
          console.error(`Failed to backup table ${table}:`, error);
          throw error;
        }

        backupData[table] = data || [];
      }

      // Add metadata
      backupData._metadata = {
        created_at: new Date().toISOString(),
        foundation_id: foundationId || null,
        version: '1.0.0',
        total_records: Object.values(backupData).reduce((sum: number, records: any) => 
          sum + (Array.isArray(records) ? records.length : 0), 0)
      };

      // Write backup file
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

      console.log(`✅ Backup created successfully: ${backupFileName}`);
      console.log(`📊 Total records backed up: ${backupData._metadata.total_records}`);

      return backupPath;
    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    }
  }

  static async restoreBackup(backupPath: string): Promise<void> {
    console.log('📥 Restoring database backup...');

    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file not found');
    }

    try {
      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
      
      if (!backupData._metadata) {
        throw new Error('Invalid backup file format');
      }

      console.log(`Restoring backup from: ${backupData._metadata.created_at}`);
      console.log(`Total records to restore: ${backupData._metadata.total_records}`);

      // Restore tables in dependency order
      const restoreOrder = [
        'profiles',
        'foundations',
        'foundation_members',
        'documents',
        'document_versions',
        'meetings',
        'meeting_minutes',
        'projects',
        'grants',
        'expenses',
        'investments',
        'audit_logs'
      ];

      for (const table of restoreOrder) {
        if (backupData[table] && backupData[table].length > 0) {
          console.log(`Restoring table: ${table} (${backupData[table].length} records)`);
          
          const { error } = await supabase
            .from(table)
            .insert(backupData[table]);

          if (error) {
            console.error(`Failed to restore table ${table}:`, error);
            throw error;
          }
        }
      }

      console.log('✅ Backup restored successfully');
    } catch (error) {
      console.error('❌ Restore failed:', error);
      throw error;
    }
  }

  static async listBackups(): Promise<string[]> {
    if (!fs.existsSync(this.backupDir)) {
      return [];
    }

    const files = fs.readdirSync(this.backupDir);
    return files.filter(file => file.endsWith('.json'));
  }

  static async deleteBackup(fileName: string): Promise<void> {
    const backupPath = path.join(this.backupDir, fileName);
    
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
      console.log(`🗑️ Backup deleted: ${fileName}`);
    } else {
      throw new Error('Backup file not found');
    }
  }

  static async scheduleBackup(foundationId?: string): Promise<void> {
    // This would be called by a cron job
    try {
      const backupPath = await this.createBackup(foundationId);
      
      // Clean up old backups (keep last 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const backups = await this.listBackups();
      
      for (const backup of backups) {
        const backupPath = path.join(this.backupDir, backup);
        const stats = fs.statSync(backupPath);
        
        if (stats.mtime.getTime() < thirtyDaysAgo) {
          await this.deleteBackup(backup);
        }
      }
      
      console.log('📅 Scheduled backup completed');
    } catch (error) {
      console.error('❌ Scheduled backup failed:', error);
    }
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'create':
      BackupService.createBackup(arg).then(path => {
        console.log(`Backup created: ${path}`);
        process.exit(0);
      }).catch(error => {
        console.error('Backup failed:', error);
        process.exit(1);
      });
      break;

    case 'restore':
      if (!arg) {
        console.error('Please provide backup file path');
        process.exit(1);
      }
      BackupService.restoreBackup(arg).then(() => {
        console.log('Backup restored successfully');
        process.exit(0);
      }).catch(error => {
        console.error('Restore failed:', error);
        process.exit(1);
      });
      break;

    case 'list':
      BackupService.listBackups().then(backups => {
        console.log('Available backups:');
        backups.forEach(backup => console.log(`  ${backup}`));
        process.exit(0);
      }).catch(error => {
        console.error('Failed to list backups:', error);
        process.exit(1);
      });
      break;

    default:
      console.log('Usage:');
      console.log('  npm run backup create [foundation_id]');
      console.log('  npm run backup restore <backup_file>');
      console.log('  npm run backup list');
      process.exit(1);
  }
}