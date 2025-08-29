import { supabase } from '../config/database';

export class FileService {
  static async uploadFile(
    bucket: string,
    filePath: string,
    fileBuffer: Buffer,
    contentType: string,
    upsert: boolean = false
  ): Promise<string> {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert
      });

    if (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }

    return filePath;
  }

  static async deleteFile(bucket: string, filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  static async getSignedUrl(
    bucket: string,
    filePath: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  static async getPublicUrl(bucket: string, filePath: string): Promise<string> {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  static async moveFile(
    bucket: string,
    fromPath: string,
    toPath: string
  ): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .move(fromPath, toPath);

    if (error) {
      throw new Error(`File move failed: ${error.message}`);
    }
  }

  static async copyFile(
    bucket: string,
    fromPath: string,
    toPath: string
  ): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .copy(fromPath, toPath);

    if (error) {
      throw new Error(`File copy failed: ${error.message}`);
    }
  }

  static validateFileType(mimetype: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimetype);
  }

  static validateFileSize(size: number, maxSize: number): boolean {
    return size <= maxSize;
  }

  static generateUniqueFileName(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    const baseName = originalName.split('.').slice(0, -1).join('.');
    
    return prefix 
      ? `${prefix}-${timestamp}-${random}-${baseName}.${extension}`
      : `${timestamp}-${random}-${baseName}.${extension}`;
  }
}