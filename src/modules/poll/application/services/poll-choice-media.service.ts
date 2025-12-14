import { Injectable, NotFoundException, UnauthorizedException, Inject } from '@nestjs/common';
import { PollChoiceMedia } from '../../infrastructure/entities/poll-choice-media.entity';
import type { PollChoiceMediaRepositoryPort } from '../ports/poll-choice-media.port';
import type { PollChoiceRepositoryPort } from '../../domain/ports/poll.ports';
import { LocalFileUploadService } from '../../infrastructure/adapters/local-file-upload.service';
import type { UploadedFile, FileUploadResult } from '../../domain/ports/poll.ports';
import { MediaType } from '../../infrastructure/entities/poll-choice-media.entity';
import { POLL_CHOICE_MEDIA_REPOSITORY, POLL_CHOICE_REPOSITORY } from '../../poll.tokens';

@Injectable()
export class PollChoiceMediaService {
  constructor(
    @Inject(POLL_CHOICE_MEDIA_REPOSITORY)
    private readonly pollChoiceMediaRepository: PollChoiceMediaRepositoryPort,
    @Inject(POLL_CHOICE_REPOSITORY)
    private readonly pollChoiceRepository: PollChoiceRepositoryPort,
    private readonly fileUploadService: LocalFileUploadService,
  ) {}

  async addMediaToChoice(
    choiceId: string,
    files: UploadedFile[],
    userId: string,
  ): Promise<PollChoiceMedia[]> {
    // Check if choice exists and user has permission
    const choice = await this.pollChoiceRepository.findById(choiceId);
    if (!choice) {
      throw new Error('Poll choice not found');
    }

    // Load the poll to check permissions
    if (choice.poll.createdBy !== userId) {
      throw new Error('Only poll creator can add media to choices');
    }

    // Upload files
    const uploadResults = await this.fileUploadService.uploadMultipleFiles(files);

    // Create media records
    const mediaItems: Partial<PollChoiceMedia>[] = uploadResults.map((result, index) => ({
      pollChoiceId: choiceId,
      fileName: result.fileName,
      originalName: result.originalName,
      url: result.url,
      mediaType: this.getMediaTypeFromMimeType(result.mimeType),
      mimeType: result.mimeType,
      size: result.size,
      order: index,
    }));

    return this.pollChoiceMediaRepository.bulkCreate(mediaItems);
  }

  async updatePollMainImage(
    pollId: string,
    file: UploadedFile,
    userId: string,
  ): Promise<FileUploadResult> {
    // This would be handled by the poll service/repository
    // For now, we'll just upload the file and return the result
    const result = await this.fileUploadService.uploadSingleFile(file);
    return result;
  }

  async deleteMedia(mediaId: string, userId: string): Promise<void> {
    const media = await this.pollChoiceMediaRepository.findById(mediaId);
    if (!media) {
      throw new Error('Media not found');
    }

    // Load the poll choice and poll to check permissions
    const choice = await this.pollChoiceRepository.findById(media.pollChoiceId);
    if (!choice || choice.poll.createdBy !== userId) {
      throw new Error('Only poll creator can delete media');
    }

    // Delete file from storage
    await this.fileUploadService.deleteFile(media.fileName);

    // Delete media record
    await this.pollChoiceMediaRepository.delete(mediaId);
  }

  private getMediaTypeFromMimeType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return MediaType.IMAGE;
    if (mimeType.startsWith('video/')) return MediaType.VIDEO;
    if (mimeType === 'application/pdf') return MediaType.DOCUMENT;
    return MediaType.DOCUMENT;
  }
}
