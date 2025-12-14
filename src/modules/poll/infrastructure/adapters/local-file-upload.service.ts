import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { FileUploadServicePort } from '../../domain/ports/poll.ports';

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

  async uploadFile(file: Buffer, fileName: string, contentType: string): Promise<string> {
    const fileExtension = path.extname(fileName);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadDir, uniqueFileName);

    await fs.writeFile(filePath, file);
    
    return `${this.baseUrl}/uploads/poll-media/${uniqueFileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract filename from URL
      const fileName = path.basename(new URL(fileUrl).pathname);
      const filePath = path.join(this.uploadDir, fileName);
      
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Failed to delete file:', error);
      // Don't throw error - file might not exist
    }
  }

  async generateUploadUrl(fileName: string, contentType: string): Promise<{ uploadUrl: string; fileUrl: string }> {
    // For local storage, we'll return a placeholder URL
    // In a real S3-compatible service, this would generate a presigned URL
    const fileExtension = path.extname(fileName);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const fileUrl = `${this.baseUrl}/uploads/poll-media/${uniqueFileName}`;
    
    return {
      uploadUrl: `${this.baseUrl}/api/polls/upload`, // We'll create this endpoint
      fileUrl,
    };
  }
}
