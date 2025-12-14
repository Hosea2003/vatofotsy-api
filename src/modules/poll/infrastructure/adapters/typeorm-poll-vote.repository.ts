import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PollVote } from '../entities/poll-vote.entity';
import type { PollVoteRepositoryPort } from '../../domain/ports/poll.ports';

@Injectable()
export class TypeOrmPollVoteRepository implements PollVoteRepositoryPort {
  constructor(
    @InjectRepository(PollVote)
    private readonly voteRepository: Repository<PollVote>,
  ) {}

  async create(voteData: Partial<PollVote>): Promise<PollVote> {
    const vote = this.voteRepository.create(voteData);
    return await this.voteRepository.save(vote);
  }

  async findById(id: string): Promise<PollVote | null> {
    return await this.voteRepository.findOne({
      where: { id },
      relations: ['poll', 'choice', 'user'],
    });
  }

  async findByPoll(pollId: string): Promise<PollVote[]> {
    return await this.voteRepository.find({
      where: { pollId },
      relations: ['choice', 'user'],
      order: { votedAt: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<PollVote[]> {
    return await this.voteRepository.find({
      where: { userId },
      relations: ['poll', 'choice'],
      order: { votedAt: 'DESC' },
    });
  }

  async findByPollAndUser(pollId: string, userId: string): Promise<PollVote[]> {
    return await this.voteRepository.find({
      where: { pollId, userId },
      relations: ['choice'],
      order: { votedAt: 'DESC' },
    });
  }

  async countVotesByChoice(choiceId: string): Promise<number> {
    return await this.voteRepository.count({
      where: { choiceId },
    });
  }

  async delete(id: string): Promise<void> {
    await this.voteRepository.delete(id);
  }
}
