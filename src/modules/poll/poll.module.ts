import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll } from './infrastructure/entities/poll.entity';
import { PollChoice } from './infrastructure/entities/poll-choice.entity';
import { PollVote } from './infrastructure/entities/poll-vote.entity';
import { PollChoiceMedia } from './infrastructure/entities/poll-choice-media.entity';
import { PollController } from './presentation/controllers/poll.controller';
import { PollChoiceController } from './presentation/controllers/poll-choice.controller';
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
import { TypeOrmPollRepository } from './infrastructure/adapters/poll.repository';
import { TypeOrmPollChoiceRepository } from './infrastructure/adapters/poll-choice.repository';
import { TypeOrmPollVoteRepository } from './infrastructure/adapters/poll-vote.repository';
import { TypeOrmPollChoiceMediaRepository } from './infrastructure/repositories/poll-choice-media.repository';
import { LocalFileUploadService } from './infrastructure/adapters/local-file-upload.service';
import { PollChoiceMediaService } from './application/services/poll-choice-media.service';
import { PollChoiceService } from './application/services/poll-choice.service';
import { POLL_REPOSITORY, POLL_CHOICE_REPOSITORY, POLL_VOTE_REPOSITORY, POLL_CHOICE_MEDIA_REPOSITORY, FILE_UPLOAD_SERVICE } from './poll.tokens';

@Module({
  imports: [TypeOrmModule.forFeature([Poll, PollChoice, PollVote, PollChoiceMedia])],
  controllers: [PollController, PollChoiceController],
  providers: [
    // Domain Services
    PollDomainService,
    
    // Application Services
    PollChoiceMediaService,
    PollChoiceService,
    
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
    {
      provide: POLL_CHOICE_MEDIA_REPOSITORY,
      useClass: TypeOrmPollChoiceMediaRepository,
    },
    
    // File Upload Service
    LocalFileUploadService,
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
