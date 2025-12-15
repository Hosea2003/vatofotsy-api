import { Injectable, Inject } from '@nestjs/common';
import { PollChoice } from '../../infrastructure/entities/poll-choice.entity';
import { PollChoiceMedia } from '../../infrastructure/entities/poll-choice-media.entity';
import type { PollRepositoryPort, PollChoiceRepositoryPort } from '../../domain/ports/poll.ports';
import type { PollChoiceMediaRepositoryPort } from '../ports/poll-choice-media.port';
import { LocalFileUploadService } from '../../infrastructure/adapters/local-file-upload.service';
import type { UploadedFile } from '../../domain/ports/poll.ports';
import { MediaType } from '../../infrastructure/entities/poll-choice-media.entity';
import { PollStatus } from '../../infrastructure/entities/poll.entity';
import { POLL_REPOSITORY, POLL_CHOICE_REPOSITORY, POLL_CHOICE_MEDIA_REPOSITORY } from '../../poll.tokens';

@Injectable()
export class PollChoiceService {
  constructor(
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: PollRepositoryPort,
    @Inject(POLL_CHOICE_REPOSITORY)
    private readonly pollChoiceRepository: PollChoiceRepositoryPort,
    @Inject(POLL_CHOICE_MEDIA_REPOSITORY)
    private readonly pollChoiceMediaRepository: PollChoiceMediaRepositoryPort,
    private readonly fileUploadService: LocalFileUploadService,
  ) {}

  async addChoiceToPoll(
    pollId: string,
    name: string,
    userId: string,
    description?: string,
    files: any[] = [],
  ): Promise<PollChoice> {
    // Check if poll exists and user has permission
    const poll = await this.pollRepository.findById(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    if (poll.createdBy !== userId) {
      throw new Error('Only poll creator can add choices');
    }

    // Don't allow adding choices to active or ended polls
    if (poll.status !== PollStatus.DRAFT) {
      throw new Error('Cannot add choices to active or ended polls');
    }

    // Get current choice count to determine order
    const existingChoices = await this.pollChoiceRepository.findByPoll(pollId);
    const order = existingChoices.length;

    // Create the choice
    const choiceData = {
      pollId,
      name,
      description,
      order,
    };

    const choice = await this.pollChoiceRepository.create(choiceData);

    // Upload files and create media records if files provided
    if (files && files.length > 0) {
      const uploadedFiles = files.map(file => ({
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        buffer: file.buffer,
        size: file.size,
      }));

      const uploadResults = await this.fileUploadService.uploadMultipleFiles(uploadedFiles);

      // Create media records
      const mediaItems: Partial<PollChoiceMedia>[] = uploadResults.map((result, index) => ({
        pollChoiceId: choice.id,
        fileName: result.fileName,
        originalName: result.originalName,
        url: result.url,
        mediaType: this.getMediaTypeFromMimeType(result.mimeType),
        mimeType: result.mimeType,
        size: result.size,
        order: index,
      }));

      await this.pollChoiceMediaRepository.bulkCreate(mediaItems);
    }

    // Return choice with media
    return this.pollChoiceRepository.findById(choice.id) as Promise<PollChoice>;
  }

  async getChoicesByPoll(pollId: string): Promise<PollChoice[]> {
    const poll = await this.pollRepository.findById(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    return this.pollChoiceRepository.findByPoll(pollId);
  }

  async updateChoice(
    choiceId: string,
    userId: string,
    name?: string,
    description?: string,
  ): Promise<PollChoice> {
    const choice = await this.pollChoiceRepository.findById(choiceId);
    if (!choice) {
      throw new Error('Choice not found');
    }

    if (choice.poll.createdBy !== userId) {
      throw new Error('Only poll creator can update choices');
    }

    const updateData: Partial<PollChoice> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    return this.pollChoiceRepository.update(choiceId, updateData);
  }

  async deleteChoice(choiceId: string, userId: string): Promise<void> {
    const choice = await this.pollChoiceRepository.findById(choiceId);
    if (!choice) {
      throw new Error('Choice not found');
    }

    if (choice.poll.createdBy !== userId) {
      throw new Error('Only poll creator can delete choices');
    }

    // Delete associated media files
    const mediaItems = await this.pollChoiceMediaRepository.findByPollChoice(choiceId);
    if (mediaItems && mediaItems.length > 0) {
      const fileNames = mediaItems.map(media => media.fileName);
      await this.fileUploadService.deleteMultipleFiles(fileNames);
      
      // Delete media records
      for (const media of mediaItems) {
        await this.pollChoiceMediaRepository.delete(media.id);
      }
    }

    // Delete the choice
    await this.pollChoiceRepository.delete(choiceId);
  }

  private getMediaTypeFromMimeType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return MediaType.IMAGE;
    if (mimeType.startsWith('video/')) return MediaType.VIDEO;
    if (mimeType === 'application/pdf') return MediaType.DOCUMENT;
    return MediaType.DOCUMENT;
  }
}
