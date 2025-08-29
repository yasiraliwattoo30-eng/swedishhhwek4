import { supabase } from '../config/database';

export interface Document {
  id: string;
  foundation_id: string;
  uploaded_by: string;
  document_type: 'articles_of_association' | 'bylaws' | 'financial_statement' | 'board_resolution' | 'other';
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  status: 'uploaded' | 'pending_approval' | 'approved' | 'rejected';
  approval_notes?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  file_path: string;
  file_name: string;
  file_size?: number;
  uploaded_by: string;
  change_notes?: string;
  created_at: string;
}

export class DocumentModel {
  static async findById(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  static async findByFoundation(foundationId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('foundation_id', foundationId)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  }

  static async create(documentData: Partial<Document>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        ...documentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async update(id: string, documentData: Partial<Document>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update({
        ...documentData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  static async getVersions(documentId: string): Promise<DocumentVersion[]> {
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  static async createVersion(versionData: Partial<DocumentVersion>): Promise<DocumentVersion> {
    const { data, error } = await supabase
      .from('document_versions')
      .insert({
        ...versionData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}