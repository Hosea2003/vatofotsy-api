import { Injectable } from '@nestjs/common';
import { PollDomainService } from '../../domain/services/poll-domain.service';
import { PollType, ResultDisplayType } from '../../infrastructure/entities/poll.entity';

@Injectable()
export class CreatePollUseCase {
  constructor(private readonly pollDomainService: PollDomainService) {}

  async execute(
    title: string,
    createdBy: string,
    votingEndsAt: Date,
    type: PollType,
    resultDisplayType: ResultDisplayType,
    description?: string,
    organizationId?: string,
    allowMultipleChoices: boolean = false,
  ) {
    return await this.pollDomainService.createPoll(
      title,
      createdBy,
      votingEndsAt,
      type,
      resultDisplayType,
      description,
      organizationId,
      allowMultipleChoices,
    );
  }
}

@Injectable()
export class ActivatePollUseCase {
  constructor(private readonly pollDomainService: PollDomainService) {}

  async execute(pollId: string, userId: string) {
    return await this.pollDomainService.activatePoll(pollId, userId);
  }
}

@Injectable()
export class GetPollByIdUseCase {
  constructor(private readonly pollDomainService: PollDomainService) {}

  async execute(pollId: string) {
    const poll = await this.pollDomainService.getPollById(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }
    return poll;
  }
}

@Injectable()
export class GetPublicPollsUseCase {
  constructor(private readonly pollDomainService: PollDomainService) {}

  async execute() {
    return await this.pollDomainService.getPublicPolls();
  }
}

@Injectable()
export class GetUserPollsUseCase {
  constructor(private readonly pollDomainService: PollDomainService) {}

  async execute(userId: string) {
    return await this.pollDomainService.getPollsByCreator(userId);
  }
}

@Injectable()
export class GetOrganizationPollsUseCase {
  constructor(private readonly pollDomainService: PollDomainService) {}

  async execute(organizationId: string) {
    return await this.pollDomainService.getPollsByOrganization(organizationId);
  }
}

@Injectable()
export class UpdatePollUseCase {
  constructor(private readonly pollDomainService: PollDomainService) {}

  async execute(
    pollId: string,
    userId: string,
    updates: {
      title?: string;
      description?: string;
      votingEndsAt?: Date;
      resultDisplayType?: ResultDisplayType;
      allowMultipleChoices?: boolean;
    }
  ) {
    return await this.pollDomainService.updatePoll(pollId, userId, updates);
  }
}

@Injectable()
export class DeletePollUseCase {
  constructor(private readonly pollDomainService: PollDomainService) {}

  async execute(pollId: string, userId: string): Promise<void> {
    await this.pollDomainService.deletePoll(pollId, userId);
  }
}
