import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { FileUploadServicePort, UploadedFile, FileUploadResult } from '../../domain/ports/poll.ports';

@Injectable()
export class LocalFileUploadService implements FileUploadServicePort {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'poll-media');
  private readonly baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  constructor() {
    this.ensureUploadDir();
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directory:', error);
    }
  }

  async uploadSingleFile(file: UploadedFile): Promise<FileUploadResult> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadDir, fileName);

    await fs.writeFile(filePath, file.buffer);

    return {
      fileName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `${this.baseUrl}/uploads/poll-media/${fileName}`,
    };
  }

  async uploadMultipleFiles(files: UploadedFile[]): Promise<FileUploadResult[]> {
    const uploadPromises = files.map(file => this.uploadSingleFile(file));
    return Promise.all(uploadPromises);
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      const filePath = path.join(this.uploadDir, fileName);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Failed to delete file:', error);
      // Don't throw error - file might not exist
    }
  }

  async deleteMultipleFiles(fileNames: string[]): Promise<void> {
    const deletePromises = fileNames.map(fileName => this.deleteFile(fileName));
    await Promise.allSettled(deletePromises);
  }

  validateFile(file: UploadedFile): { isValid: boolean; error?: string } {
    // Max file size: 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds 10MB limit' };
    }

    // Allowed file types
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'application/pdf',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return { isValid: false, error: 'File type not allowed' };
    }

    return { isValid: true };
  }

  validateMultipleFiles(files: UploadedFile[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    files.forEach((file, index) => {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        errors.push(`File ${index + 1}: ${validation.error}`);
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  getMediaTypeFromMimeType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    if (mimeType === 'application/pdf') return 'DOCUMENT';
    return 'DOCUMENT';
  }

  // Original interface method for backward compatibility
  async uploadFile(file: Buffer, fileName: string, contentType: string): Promise<string> {
    const uploadedFile: UploadedFile = {
      fieldname: 'file',
      originalname: fileName,
      encoding: '7bit',
      mimetype: contentType,
      buffer: file,
      size: file.length,
    };
    const result = await this.uploadSingleFile(uploadedFile);
    return result.url;
  }

  async generateUploadUrl(fileName: string, contentType: string): Promise<{ uploadUrl: string; fileUrl: string }> {
    const fileExtension = path.extname(fileName);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const fileUrl = `${this.baseUrl}/uploads/poll-media/${uniqueFileName}`;
    
    return {
      uploadUrl: `${this.baseUrl}/api/polls/upload`,
      fileUrl,
    };
  }
}
