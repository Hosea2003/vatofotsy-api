import { Inject, Injectable } from '@nestjs/common';
import type { 
  PollRepositoryPort, 
  PollChoiceRepositoryPort,
  PollVoteRepositoryPort,
  FileUploadServicePort 
} from '../ports/poll.ports';
import { Poll, PollType, ResultDisplayType, PollStatus } from '../../infrastructure/entities/poll.entity';
import { PollChoice } from '../../infrastructure/entities/poll-choice.entity';
import { POLL_REPOSITORY, POLL_CHOICE_REPOSITORY, POLL_VOTE_REPOSITORY, FILE_UPLOAD_SERVICE } from '../../poll.tokens';

@Injectable()
export class PollDomainService {
  constructor(
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: PollRepositoryPort,
    @Inject(POLL_CHOICE_REPOSITORY)
    private readonly pollChoiceRepository: PollChoiceRepositoryPort,
    @Inject(POLL_VOTE_REPOSITORY)
    private readonly pollVoteRepository: PollVoteRepositoryPort,
    @Inject(FILE_UPLOAD_SERVICE)
    private readonly fileUploadService: FileUploadServicePort,
  ) {}

  async createPoll(
    title: string,
    createdBy: string,
    votingEndsAt: Date,
    type: PollType = PollType.PUBLIC,
    resultDisplayType: ResultDisplayType = ResultDisplayType.CLOSED,
    description?: string,
    organizationId?: string,
    allowMultipleChoices: boolean = false,
  ): Promise<Poll> {
    // Validate poll data
    if (type === PollType.PRIVATE && !organizationId) {
      throw new Error('Organization ID is required for private polls');
    }

    if (votingEndsAt <= new Date()) {
      throw new Error('Voting end time must be in the future');
    }

    // Create poll without choices
    const pollData = {
      title,
      description,
      createdBy,
      organizationId: organizationId && organizationId.trim() !== '' ? organizationId : undefined,
      type,
      resultDisplayType,
      votingEndsAt,
      allowMultipleChoices,
      status: PollStatus.DRAFT,
      isActive: true,
    };

    const poll = await this.pollRepository.create(pollData);

    // Return the poll (choices will be added separately)
    return poll;
  }

  async activatePoll(pollId: string, userId: string): Promise<Poll> {
    const poll = await this.pollRepository.findById(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    if (poll.createdBy !== userId) {
      throw new Error('Only poll creator can activate the poll');
    }

    if (poll.status !== PollStatus.DRAFT) {
      throw new Error('Only draft polls can be activated');
    }

    if (poll.votingEndsAt <= new Date()) {
      throw new Error('Cannot activate poll with past voting end time');
    }

    return await this.pollRepository.update(pollId, { 
      status: PollStatus.ACTIVE 
    });
  }

  async getPollById(pollId: string): Promise<Poll | null> {
    return await this.pollRepository.findById(pollId);
  }

  async getPublicPolls(): Promise<Poll[]> {
    return await this.pollRepository.findPublicPolls();
  }

  async getPollsByCreator(creatorId: string): Promise<Poll[]> {
    return await this.pollRepository.findByCreator(creatorId);
  }

  async getPollsByOrganization(organizationId: string): Promise<Poll[]> {
    return await this.pollRepository.findByOrganization(organizationId);
  }

  async canUserVoteOnPoll(pollId: string, userId: string): Promise<boolean> {
    const poll = await this.pollRepository.findById(pollId);
    if (!poll) {
      return false;
    }

    // Check if poll is active and voting is open
    if (!poll.isVotingActive) {
      return false;
    }

    // For private polls, check organization membership
    if (poll.type === PollType.PRIVATE && poll.organizationId) {
      // TODO: Check if user is member of the organization
      // This will be implemented when we integrate with organization membership
    }

    return true;
  }

  async canUserViewResults(pollId: string, userId: string): Promise<boolean> {
    const poll = await this.pollRepository.findById(pollId);
    if (!poll) {
      return false;
    }

    // Poll creator can always view results
    if (poll.createdBy === userId) {
      return true;
    }

    // Check result display settings
    return poll.canViewResults;
  }

  async updatePoll(
    pollId: string,
    userId: string,
    updates: {
      title?: string;
      description?: string;
      votingEndsAt?: Date;
      resultDisplayType?: ResultDisplayType;
      allowMultipleChoices?: boolean;
    }
  ): Promise<Poll> {
    const poll = await this.pollRepository.findById(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    if (poll.createdBy !== userId) {
      throw new Error('Only poll creator can update the poll');
    }

    // Can only update draft polls
    if (poll.status !== PollStatus.DRAFT) {
      throw new Error('Only draft polls can be updated');
    }

    // Validate voting end time if provided
    if (updates.votingEndsAt && updates.votingEndsAt <= new Date()) {
      throw new Error('Voting end time must be in the future');
    }

    return await this.pollRepository.update(pollId, updates);
  }

  async deletePoll(pollId: string, userId: string): Promise<void> {
    const poll = await this.pollRepository.findById(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    if (poll.createdBy !== userId) {
      throw new Error('Only poll creator can delete the poll');
    }

    // Delete associated media files
    if (poll.choices) {
      for (const choice of poll.choices) {
        if (choice.mediaUrl) {
          try {
            await this.fileUploadService.deleteFile(choice.mediaUrl);
          } catch (error) {
            console.error('Failed to delete media file:', error);
            // Continue with poll deletion even if file deletion fails
          }
        }
      }
    }

    await this.pollRepository.delete(pollId);
  }

  // Helper method to calculate vote counts for choices
  async calculateChoiceVoteCounts(pollId: string): Promise<Map<string, number>> {
    const choices = await this.pollChoiceRepository.findByPoll(pollId);
    const voteCounts = new Map<string, number>();

    for (const choice of choices) {
      const count = await this.pollVoteRepository.countVotesByChoice(choice.id);
      voteCounts.set(choice.id, count);
    }

    return voteCounts;
  }

  // Helper method to check if poll voting has ended and update status
  async updateExpiredPolls(): Promise<void> {
    // This would be called by a scheduled job
    // For now, we'll just implement the logic
    // TODO: Implement scheduled job to update expired polls
  }
}
