import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PollChoice } from '../entities/poll-choice.entity';
import type { PollChoiceRepositoryPort } from '../../domain/ports/poll.ports';

@Injectable()
export class TypeOrmPollChoiceRepository implements PollChoiceRepositoryPort {
  constructor(
    @InjectRepository(PollChoice)
    private readonly choiceRepository: Repository<PollChoice>,
  ) {}

  async create(choiceData: Partial<PollChoice>): Promise<PollChoice> {
    const choice = this.choiceRepository.create(choiceData);
    return await this.choiceRepository.save(choice);
  }

  async findById(id: string): Promise<PollChoice | null> {
    return await this.choiceRepository.findOne({
      where: { id },
      relations: ['poll', 'votes'],
    });
  }

  async findByPoll(pollId: string): Promise<PollChoice[]> {
    return await this.choiceRepository.find({
      where: { pollId },
      relations: ['votes'],
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async update(id: string, updateData: Partial<PollChoice>): Promise<PollChoice> {
    await this.choiceRepository.update(id, updateData);
    const updatedChoice = await this.findById(id);
    if (!updatedChoice) {
      throw new Error('Poll choice not found after update');
    }
    return updatedChoice;
  }

  async delete(id: string): Promise<void> {
    await this.choiceRepository.delete(id);
  }

  async bulkCreate(choicesData: Partial<PollChoice>[]): Promise<PollChoice[]> {
    const choices = this.choiceRepository.create(choicesData);
    return await this.choiceRepository.save(choices);
  }
}
