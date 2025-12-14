import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  HttpStatus,
  HttpCode,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import {
  CreatePollUseCase,
  ActivatePollUseCase,
  GetPollByIdUseCase,
  GetPublicPollsUseCase,
  GetUserPollsUseCase,
  UpdatePollUseCase,
  DeletePollUseCase,
} from '../../application/use-cases/poll.use-cases';
import {
  CreatePollDto,
  PollResponseDto,
  PollChoiceResponseDto,
  ErrorResponseDto,
} from '../dto';
import { CurrentUser } from '../../../auth';
import type { AuthenticatedUser } from '../../../auth';
import { PollType, ResultDisplayType } from '../../infrastructure/entities/poll.entity';

@ApiTags('polls')
@Controller('polls')
export class PollController {
  constructor(
    private readonly createPollUseCase: CreatePollUseCase,
    private readonly activatePollUseCase: ActivatePollUseCase,
    private readonly getPollByIdUseCase: GetPollByIdUseCase,
    private readonly getPublicPollsUseCase: GetPublicPollsUseCase,
    private readonly getUserPollsUseCase: GetUserPollsUseCase,
    private readonly updatePollUseCase: UpdatePollUseCase,
    private readonly deletePollUseCase: DeletePollUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Create a new poll' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Poll has been successfully created.',
    type: PollResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
    type: ErrorResponseDto,
  })
  async createPoll(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createPollDto: CreatePollDto,
  ): Promise<PollResponseDto> {
    try {
      const votingEndsAt = new Date(createPollDto.votingEndsAt);
      
      const poll = await this.createPollUseCase.execute(
        createPollDto.title,
        user.userId,
        votingEndsAt,
        createPollDto.type,
        createPollDto.resultDisplayType,
        createPollDto.choices,
        createPollDto.description,
        createPollDto.organizationId,
        createPollDto.allowMultipleChoices || false,
      );

      return new PollResponseDto({
        id: poll.id,
        title: poll.title,
        description: poll.description,
        createdBy: poll.createdBy,
        organizationId: poll.organizationId,
        type: poll.type,
        resultDisplayType: poll.resultDisplayType,
        status: poll.status,
        votingEndsAt: poll.votingEndsAt,
        allowMultipleChoices: poll.allowMultipleChoices,
        mainImageUrl: poll.mainImageUrl,
        mainImageFileName: poll.mainImageFileName,
        isActive: poll.isActive,
        isVotingActive: poll.isVotingActive,
        isVotingEnded: poll.isVotingEnded,
        canViewResults: poll.canViewResults,
        choices: poll.choices?.map(choice => new PollChoiceResponseDto({
          id: choice.id,
          name: choice.name,
          description: choice.description,
          mediaUrl: choice.mediaUrl,
          mediaType: choice.mediaType,
          mediaFileName: choice.mediaFileName,
          createdAt: choice.createdAt,
        })) || [],
        createdAt: poll.createdAt,
        updatedAt: poll.updatedAt,
        creator: poll.creator ? {
          id: poll.creator.id,
          email: poll.creator.email,
          firstName: poll.creator.firstName,
          lastName: poll.creator.lastName,
        } : undefined,
        organization: poll.organization ? {
          id: poll.organization.id,
          name: poll.organization.name,
          description: poll.organization.description,
        } : undefined,
      });
    } catch (error) {
      if (
        error.message === 'Organization ID is required for private polls' ||
        error.message === 'Voting end time must be in the future' ||
        error.message === 'A poll must have at least 2 choices'
      ) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Put(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a poll (make it live for voting)' })
  @ApiParam({
    name: 'id',
    description: 'Poll ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Poll activated successfully.',
    type: PollResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Poll not found.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Only poll creator can activate the poll.',
    type: ErrorResponseDto,
  })
  async activatePoll(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PollResponseDto> {
    try {
      const poll = await this.activatePollUseCase.execute(id, user.userId);

      return new PollResponseDto({
        id: poll.id,
        title: poll.title,
        description: poll.description,
        createdBy: poll.createdBy,
        organizationId: poll.organizationId,
        type: poll.type,
        resultDisplayType: poll.resultDisplayType,
        status: poll.status,
        votingEndsAt: poll.votingEndsAt,
        allowMultipleChoices: poll.allowMultipleChoices,
        mainImageUrl: poll.mainImageUrl,
        mainImageFileName: poll.mainImageFileName,
        isActive: poll.isActive,
        isVotingActive: poll.isVotingActive,
        isVotingEnded: poll.isVotingEnded,
        canViewResults: poll.canViewResults,
        choices: poll.choices?.map(choice => new PollChoiceResponseDto({
          id: choice.id,
          name: choice.name,
          description: choice.description,
          mediaUrl: choice.mediaUrl,
          mediaType: choice.mediaType,
          mediaFileName: choice.mediaFileName,
          createdAt: choice.createdAt,
        })) || [],
        createdAt: poll.createdAt,
        updatedAt: poll.updatedAt,
      });
    } catch (error) {
      if (error.message === 'Poll not found') {
        throw new NotFoundException('Poll not found');
      }
      if (
        error.message === 'Only poll creator can activate the poll' ||
        error.message === 'Only draft polls can be activated' ||
        error.message === 'Cannot activate poll with past voting end time'
      ) {
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get('public')
  @ApiOperation({ summary: 'Get all public polls' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of public polls.',
    type: [PollResponseDto],
  })
  async getPublicPolls(): Promise<PollResponseDto[]> {
    const polls = await this.getPublicPollsUseCase.execute();

    return polls.map(poll => new PollResponseDto({
      id: poll.id,
      title: poll.title,
      description: poll.description,
      createdBy: poll.createdBy,
      organizationId: poll.organizationId,
      type: poll.type,
      resultDisplayType: poll.resultDisplayType,
      status: poll.status,
      votingEndsAt: poll.votingEndsAt,
      allowMultipleChoices: poll.allowMultipleChoices,
      mainImageUrl: poll.mainImageUrl,
      mainImageFileName: poll.mainImageFileName,
      isActive: poll.isActive,
      isVotingActive: poll.isVotingActive,
      isVotingEnded: poll.isVotingEnded,
      canViewResults: poll.canViewResults,
      choices: poll.choices?.map(choice => new PollChoiceResponseDto({
        id: choice.id,
        name: choice.name,
        description: choice.description,
        mediaUrl: choice.mediaUrl,
        mediaType: choice.mediaType,
        mediaFileName: choice.mediaFileName,
        createdAt: choice.createdAt,
      })) || [],
      createdAt: poll.createdAt,
      updatedAt: poll.updatedAt,
      creator: poll.creator ? {
        id: poll.creator.id,
        email: poll.creator.email,
        firstName: poll.creator.firstName,
        lastName: poll.creator.lastName,
      } : undefined,
    }));
  }

  @Get('my-polls')
  @ApiOperation({ summary: 'Get current user polls' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of user polls.',
    type: [PollResponseDto],
  })
  async getUserPolls(@CurrentUser() user: AuthenticatedUser): Promise<PollResponseDto[]> {
    const polls = await this.getUserPollsUseCase.execute(user.userId);

    return polls.map(poll => new PollResponseDto({
      id: poll.id,
      title: poll.title,
      description: poll.description,
      createdBy: poll.createdBy,
      organizationId: poll.organizationId,
      type: poll.type,
      resultDisplayType: poll.resultDisplayType,
      status: poll.status,
      votingEndsAt: poll.votingEndsAt,
      allowMultipleChoices: poll.allowMultipleChoices,
      mainImageUrl: poll.mainImageUrl,
      mainImageFileName: poll.mainImageFileName,
      isActive: poll.isActive,
      isVotingActive: poll.isVotingActive,
      isVotingEnded: poll.isVotingEnded,
      canViewResults: poll.canViewResults,
      choices: poll.choices?.map(choice => new PollChoiceResponseDto({
        id: choice.id,
        name: choice.name,
        description: choice.description,
        mediaUrl: choice.mediaUrl,
        mediaType: choice.mediaType,
        mediaFileName: choice.mediaFileName,
        createdAt: choice.createdAt,
      })) || [],
      createdAt: poll.createdAt,
      updatedAt: poll.updatedAt,
      organization: poll.organization ? {
        id: poll.organization.id,
        name: poll.organization.name,
        description: poll.organization.description,
      } : undefined,
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get poll by ID' })
  @ApiParam({
    name: 'id',
    description: 'Poll ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Poll found.',
    type: PollResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Poll not found.',
    type: ErrorResponseDto,
  })
  async getPollById(@Param('id') id: string): Promise<PollResponseDto> {
    try {
      const poll = await this.getPollByIdUseCase.execute(id);

      return new PollResponseDto({
        id: poll.id,
        title: poll.title,
        description: poll.description,
        createdBy: poll.createdBy,
        organizationId: poll.organizationId,
        type: poll.type,
        resultDisplayType: poll.resultDisplayType,
        status: poll.status,
        votingEndsAt: poll.votingEndsAt,
        allowMultipleChoices: poll.allowMultipleChoices,
        mainImageUrl: poll.mainImageUrl,
        mainImageFileName: poll.mainImageFileName,
        isActive: poll.isActive,
        isVotingActive: poll.isVotingActive,
        isVotingEnded: poll.isVotingEnded,
        canViewResults: poll.canViewResults,
        choices: poll.choices?.map(choice => new PollChoiceResponseDto({
          id: choice.id,
          name: choice.name,
          description: choice.description,
          mediaUrl: choice.mediaUrl,
          mediaType: choice.mediaType,
          mediaFileName: choice.mediaFileName,
          createdAt: choice.createdAt,
        })) || [],
        createdAt: poll.createdAt,
        updatedAt: poll.updatedAt,
        creator: poll.creator ? {
          id: poll.creator.id,
          email: poll.creator.email,
          firstName: poll.creator.firstName,
          lastName: poll.creator.lastName,
        } : undefined,
        organization: poll.organization ? {
          id: poll.organization.id,
          name: poll.organization.name,
          description: poll.organization.description,
        } : undefined,
      });
    } catch (error) {
      if (error.message === 'Poll not found') {
        throw new NotFoundException('Poll not found');
      }
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete poll by ID' })
  @ApiParam({
    name: 'id',
    description: 'Poll ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Poll deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Poll not found.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Only poll creator can delete the poll.',
    type: ErrorResponseDto,
  })
  async deletePoll(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    try {
      await this.deletePollUseCase.execute(id, user.userId);
    } catch (error) {
      if (error.message === 'Poll not found') {
        throw new NotFoundException('Poll not found');
      }
      if (error.message === 'Only poll creator can delete the poll') {
        throw new UnauthorizedException('Only poll creator can delete the poll');
      }
      throw error;
    }
  }
}
