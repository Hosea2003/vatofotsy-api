import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll, PollType } from '../entities/poll.entity';
import type { PollRepositoryPort } from '../../domain/ports/poll.ports';

@Injectable()
export class TypeOrmPollRepository implements PollRepositoryPort {
  constructor(
    @InjectRepository(Poll)
    private readonly pollRepository: Repository<Poll>,
  ) {}

  async create(pollData: Partial<Poll>): Promise<Poll> {
    const poll = this.pollRepository.create(pollData);
    return await this.pollRepository.save(poll);
  }

  async findById(id: string): Promise<Poll | null> {
    return await this.pollRepository.findOne({
      where: { id },
      relations: ['creator', 'organization', 'choices', 'votes'],
    });
  }

  async findByCreator(creatorId: string): Promise<Poll[]> {
    return await this.pollRepository.find({
      where: { createdBy: creatorId },
      relations: ['creator', 'organization', 'choices'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByOrganization(organizationId: string): Promise<Poll[]> {
    return await this.pollRepository.find({
      where: { organizationId },
      relations: ['creator', 'organization', 'choices'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPublicPolls(): Promise<Poll[]> {
    return await this.pollRepository.find({
      where: { type: PollType.PUBLIC, isActive: true },
      relations: ['creator', 'choices'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateData: Partial<Poll>): Promise<Poll> {
    await this.pollRepository.update(id, updateData);
    const updatedPoll = await this.findById(id);
    if (!updatedPoll) {
      throw new Error('Poll not found after update');
    }
    return updatedPoll;
  }

  async delete(id: string): Promise<void> {
    await this.pollRepository.delete(id);
  }
}
