import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll } from './infrastructure/entities/poll.entity';
import { PollChoice } from './infrastructure/entities/poll-choice.entity';
import { PollVote } from './infrastructure/entities/poll-vote.entity';
import { PollController } from './presentation/controllers/poll.controller';
import { PollDomainService } from './domain/services/poll-domain.service';
import {
  CreatePollUseCase,
  ActivatePollUseCase,
  GetPollByIdUseCase,
  GetPublicPollsUseCase,
  GetUserPollsUseCase,
  UpdatePollUseCase,
  DeletePollUseCase,
} from './application/use-cases/poll.use-cases';
import { TypeOrmPollRepository } from './infrastructure/adapters/typeorm-poll.repository';
import { TypeOrmPollChoiceRepository } from './infrastructure/adapters/typeorm-poll-choice.repository';
import { TypeOrmPollVoteRepository } from './infrastructure/adapters/typeorm-poll-vote.repository';
import { LocalFileUploadService } from './infrastructure/adapters/local-file-upload.service';
import { POLL_REPOSITORY, POLL_CHOICE_REPOSITORY, POLL_VOTE_REPOSITORY, FILE_UPLOAD_SERVICE } from './poll.tokens';

@Module({
  imports: [TypeOrmModule.forFeature([Poll, PollChoice, PollVote])],
  controllers: [PollController],
  providers: [
    // Domain Services
    PollDomainService,
    
    // Use Cases
    CreatePollUseCase,
    ActivatePollUseCase,
    GetPollByIdUseCase,
    GetPublicPollsUseCase,
    GetUserPollsUseCase,
    UpdatePollUseCase,
    DeletePollUseCase,
    
    // Repositories
    {
      provide: POLL_REPOSITORY,
      useClass: TypeOrmPollRepository,
    },
    {
      provide: POLL_CHOICE_REPOSITORY,
      useClass: TypeOrmPollChoiceRepository,
    },
    {
      provide: POLL_VOTE_REPOSITORY,
      useClass: TypeOrmPollVoteRepository,
    },
    
    // File Upload Service
    {
      provide: FILE_UPLOAD_SERVICE,
      useClass: LocalFileUploadService,
    },
  ],
  exports: [
    PollDomainService,
    CreatePollUseCase,
    ActivatePollUseCase,
    GetPollByIdUseCase,
    GetPublicPollsUseCase,
    GetUserPollsUseCase,
    UpdatePollUseCase,
    DeletePollUseCase,
  ],
})
export class PollModule {}
