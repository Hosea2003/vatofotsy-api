import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PollChoiceMedia } from '../entities/poll-choice-media.entity';
import type { PollChoiceMediaRepositoryPort } from '../../application/ports/poll-choice-media.port';

@Injectable()
export class TypeOrmPollChoiceMediaRepository implements PollChoiceMediaRepositoryPort {
  constructor(
    @InjectRepository(PollChoiceMedia)
    private readonly repository: Repository<PollChoiceMedia>,
  ) {}

  async create(mediaData: Partial<PollChoiceMedia>): Promise<PollChoiceMedia> {
    const media = this.repository.create(mediaData);
    return this.repository.save(media);
  }

  async findById(id: string): Promise<PollChoiceMedia | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['pollChoice', 'pollChoice.poll'],
    });
  }

  async findByPollChoice(pollChoiceId: string): Promise<PollChoiceMedia[]> {
    return this.repository.find({
      where: { pollChoiceId },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async update(id: string, updateData: Partial<PollChoiceMedia>): Promise<PollChoiceMedia> {
    await this.repository.update(id, updateData);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Poll choice media not found after update');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async bulkCreate(mediaData: Partial<PollChoiceMedia>[]): Promise<PollChoiceMedia[]> {
    const media = this.repository.create(mediaData);
    return this.repository.save(media);
  }
}
