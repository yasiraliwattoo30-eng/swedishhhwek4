/*
  # Create storage buckets and policies

  1. Storage Buckets
    - `documents` - For foundation documents
    - `receipts` - For expense receipts
    - `reports` - For generated reports

  2. Storage Policies
    - Configure RLS for secure file access
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('documents', 'documents', false),
  ('receipts', 'receipts', false),
  ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- Documents bucket policies
CREATE POLICY "Foundation members can view documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.file_path = name AND is_foundation_member(d.foundation_id)
    )
  );

CREATE POLICY "Foundation members can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Document owners can update documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.file_path = name AND (
        d.uploaded_by = auth.uid() OR 
        is_foundation_owner(d.foundation_id)
      )
    )
  );

CREATE POLICY "Document owners can delete documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.file_path = name AND (
        d.uploaded_by = auth.uid() OR 
        is_foundation_owner(d.foundation_id)
      )
    )
  );

-- Receipts bucket policies
CREATE POLICY "Users can view relevant receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'receipts' AND
    EXISTS (
      SELECT 1 FROM expenses e
      WHERE e.receipt_url = name AND (
        e.user_id = auth.uid() OR 
        is_foundation_owner(e.foundation_id)
      )
    )
  );

CREATE POLICY "Users can upload receipts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'receipts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Receipt owners can update receipts"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'receipts' AND
    EXISTS (
      SELECT 1 FROM expenses e
      WHERE e.receipt_url = name AND (
        e.user_id = auth.uid() OR 
        is_foundation_owner(e.foundation_id)
      )
    )
  );

CREATE POLICY "Receipt owners can delete receipts"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'receipts' AND
    EXISTS (
      SELECT 1 FROM expenses e
      WHERE e.receipt_url = name AND (
        e.user_id = auth.uid() OR 
        is_foundation_owner(e.foundation_id)
      )
    )
  );

-- Reports bucket policies
CREATE POLICY "Foundation members can view reports"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'reports' AND
    EXISTS (
      SELECT 1 FROM financial_reports fr
      WHERE fr.file_path = name AND is_foundation_member(fr.foundation_id)
    )
  );

CREATE POLICY "Foundation owners can upload reports"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Foundation owners can update reports"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'reports' AND
    EXISTS (
      SELECT 1 FROM financial_reports fr
      WHERE fr.file_path = name AND is_foundation_owner(fr.foundation_id)
    )
  );

CREATE POLICY "Foundation owners can delete reports"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'reports' AND
    EXISTS (
      SELECT 1 FROM financial_reports fr
      WHERE fr.file_path = name AND is_foundation_owner(fr.foundation_id)
    )
  );