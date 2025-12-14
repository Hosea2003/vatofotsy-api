import { Poll } from '../../infrastructure/entities/poll.entity';
import { PollChoice } from '../../infrastructure/entities/poll-choice.entity';
import { PollVote } from '../../infrastructure/entities/poll-vote.entity';

export interface PollRepositoryPort {
  create(pollData: Partial<Poll>): Promise<Poll>;
  findById(id: string): Promise<Poll | null>;
  findByCreator(creatorId: string): Promise<Poll[]>;
  findByOrganization(organizationId: string): Promise<Poll[]>;
  findPublicPolls(): Promise<Poll[]>;
  update(id: string, updateData: Partial<Poll>): Promise<Poll>;
  delete(id: string): Promise<void>;
}

export interface PollChoiceRepositoryPort {
  create(choiceData: Partial<PollChoice>): Promise<PollChoice>;
  findById(id: string): Promise<PollChoice | null>;
  findByPoll(pollId: string): Promise<PollChoice[]>;
  update(id: string, updateData: Partial<PollChoice>): Promise<PollChoice>;
  delete(id: string): Promise<void>;
  bulkCreate(choicesData: Partial<PollChoice>[]): Promise<PollChoice[]>;
}

export interface PollVoteRepositoryPort {
  create(voteData: Partial<PollVote>): Promise<PollVote>;
  findById(id: string): Promise<PollVote | null>;
  findByPoll(pollId: string): Promise<PollVote[]>;
  findByUser(userId: string): Promise<PollVote[]>;
  findByPollAndUser(pollId: string, userId: string): Promise<PollVote[]>;
  countVotesByChoice(choiceId: string): Promise<number>;
  delete(id: string): Promise<void>;
}

export interface FileUploadServicePort {
  uploadFile(file: Buffer, fileName: string, contentType: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
  generateUploadUrl(fileName: string, contentType: string): Promise<{ uploadUrl: string; fileUrl: string }>;
}
