import { PollChoiceMedia } from '../../infrastructure/entities/poll-choice-media.entity';

export interface PollChoiceMediaRepositoryPort {
  create(mediaData: Partial<PollChoiceMedia>): Promise<PollChoiceMedia>;
  findById(id: string): Promise<PollChoiceMedia | null>;
  findByPollChoice(pollChoiceId: string): Promise<PollChoiceMedia[]>;
  update(id: string, updateData: Partial<PollChoiceMedia>): Promise<PollChoiceMedia>;
  delete(id: string): Promise<void>;
  bulkCreate(mediaData: Partial<PollChoiceMedia>[]): Promise<PollChoiceMedia[]>;
}
