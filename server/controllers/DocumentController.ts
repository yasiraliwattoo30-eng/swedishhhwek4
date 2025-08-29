import { Response } from 'express';
import { supabase } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export class DocumentController {
  static getDocuments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { foundation_id, document_type, status } = req.query;

    let query = supabase
      .from('documents')
      .select(`
        *,
        foundations(name),
        profiles!documents_uploaded_by_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (foundation_id) {
      query = query.eq('foundation_id', foundation_id);
    }
    if (document_type) {
      query = query.eq('document_type', document_type);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: documents, error } = await query;

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({
      documents: documents || [],
      total: documents?.length || 0
    });
  });

  static getDocumentById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const { data: document, error } = await supabase
      .from('documents')
      .select(`
        *,
        foundations(name),
        profiles!documents_uploaded_by_fkey(full_name, email),
        document_versions(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw createError('Document not found', 404);
    }

    res.json({ document });
  });

  static uploadDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { foundation_id, document_type, notes } = req.body;
    const file = req.file;

    if (!file) {
      throw createError('No file uploaded', 400);
    }

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = `documents/${foundation_id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      throw createError('File upload failed', 500);
    }

    // Create document record
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .insert({
        foundation_id,
        uploaded_by: req.user?.id,
        document_type,
        file_name: file.originalname,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.mimetype,
        status: 'uploaded',
        approval_notes: notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (documentError) {
      // Clean up uploaded file if document creation fails
      await supabase.storage.from('documents').remove([filePath]);
      throw createError(documentError.message, 400);
    }

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });
  });

  static updateDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status, approval_notes } = req.body;

    const { data: document, error } = await supabase
      .from('documents')
      .update({
        status,
        approval_notes,
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
      message: 'Document updated successfully',
      document
    });
  });

  static deleteDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    // Get document to find file path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw createError('Document not found', 404);
    }

    // Delete file from storage
    if (document.file_path) {
      await supabase.storage
        .from('documents')
        .remove([document.file_path]);
    }

    // Delete document record
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      throw createError(error.message, 400);
    }

    res.json({ message: 'Document deleted successfully' });
  });

  static downloadDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    // Get document
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('file_path, file_name, mime_type')
      .eq('id', id)
      .single();

    if (documentError) {
      throw createError('Document not found', 404);
    }

    // Get signed URL for download
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(document.file_path, 3600); // 1 hour expiry

    if (urlError) {
      throw createError('Failed to generate download URL', 500);
    }

    res.json({
      download_url: signedUrl.signedUrl,
      file_name: document.file_name,
      mime_type: document.mime_type
    });
  });

  static getDocumentVersions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const { data: versions, error } = await supabase
      .from('document_versions')
      .select(`
        *,
        profiles!document_versions_uploaded_by_fkey(full_name, email)
      `)
      .eq('document_id', id)
      .order('version_number', { ascending: false });

    if (error) {
      throw createError(error.message, 500);
    }

    res.json({
      versions: versions || [],
      total: versions?.length || 0
    });
  });

  static uploadDocumentVersion = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { change_notes } = req.body;
    const file = req.file;

    if (!file) {
      throw createError('No file uploaded', 400);
    }

    // Get current document
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('foundation_id')
      .eq('id', id)
      .single();

    if (documentError) {
      throw createError('Document not found', 404);
    }

    // Get next version number
    const { data: lastVersion, error: versionError } = await supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const nextVersionNumber = (lastVersion?.version_number || 0) + 1;

    // Upload new version file
    const fileName = `${Date.now()}-v${nextVersionNumber}-${file.originalname}`;
    const filePath = `documents/${document.foundation_id}/versions/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      throw createError('File upload failed', 500);
    }

    // Create version record
    const { data: version, error: versionInsertError } = await supabase
      .from('document_versions')
      .insert({
        document_id: id,
        version_number: nextVersionNumber,
        file_path: filePath,
        file_name: file.originalname,
        file_size: file.size,
        uploaded_by: req.user?.id,
        change_notes,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (versionInsertError) {
      // Clean up uploaded file if version creation fails
      await supabase.storage.from('documents').remove([filePath]);
      throw createError(versionInsertError.message, 400);
    }

    res.status(201).json({
      message: 'Document version uploaded successfully',
      version
    });
  });
}