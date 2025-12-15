import { IsString, IsOptional, IsEnum, IsDateString, IsBoolean, IsArray, ValidateNested, IsUUID, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PollType, ResultDisplayType, PollStatus } from '../../infrastructure/entities/poll.entity';
import { MediaType } from '../../infrastructure/entities/poll-choice.entity';

// Export file upload DTOs
export * from './file-upload.dto';

export class CreatePollChoiceDto {
  @ApiProperty({
    example: 'Option A',
    description: 'Choice name',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({
    example: 'Description for option A',
    description: 'Choice description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'Media URL for the choice',
    required: false,
  })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiProperty({
    example: 'IMAGE',
    description: 'Type of media',
    enum: MediaType,
    required: false,
  })
  @IsOptional()
  @IsEnum(MediaType)
  mediaType?: MediaType;

  @ApiProperty({
    example: 'image.jpg',
    description: 'Original filename of the media',
    required: false,
  })
  @IsOptional()
  @IsString()
  mediaFileName?: string;
}

export class UpdatePollChoiceDto {
  @ApiProperty({
    example: 'Updated Option A',
    description: 'Choice name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiProperty({
    example: 'Updated description for option A',
    description: 'Choice description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class CreatePollDto {
  @ApiProperty({
    example: 'What is your favorite programming language?',
    description: 'Poll title',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title: string;

  @ApiProperty({
    example: 'Please select your preferred programming language for the next project',
    description: 'Poll description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Organization ID (required for private polls)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiProperty({
    example: 'PUBLIC',
    description: 'Poll visibility type',
    enum: PollType,
  })
  @IsEnum(PollType)
  type: PollType;

  @ApiProperty({
    example: 'CLOSED',
    description: 'When results can be viewed',
    enum: ResultDisplayType,
  })
  @IsEnum(ResultDisplayType)
  resultDisplayType: ResultDisplayType;

  @ApiProperty({
    example: '2023-12-31T23:59:59Z',
    description: 'When voting ends',
  })
  @IsDateString()
  votingEndsAt: string;

  @ApiProperty({
    example: false,
    description: 'Allow users to select multiple choices',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  allowMultipleChoices?: boolean;

  @ApiProperty({
    example: 'http://localhost:3000/uploads/poll-media/main-image.jpg',
    description: 'Main image URL for the poll',
    required: false,
  })
  @IsOptional()
  @IsString()
  mainImageUrl?: string;

  @ApiProperty({
    example: 'main-image.jpg',
    description: 'Main image filename',
    required: false,
  })
  @IsOptional()
  @IsString()
  mainImageFileName?: string;

}

export class PollChoiceResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Choice ID',
  })
  id: string;

  @ApiProperty({
    example: 'Option A',
    description: 'Choice name',
  })
  name: string;

  @ApiProperty({
    example: 'Description for option A',
    description: 'Choice description',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'Media URL',
    nullable: true,
  })
  mediaUrl: string | null;

  @ApiProperty({
    example: 'IMAGE',
    description: 'Media type',
    enum: MediaType,
    nullable: true,
  })
  mediaType: MediaType | null;

  @ApiProperty({
    example: 'image.jpg',
    description: 'Original media filename',
    nullable: true,
  })
  mediaFileName: string | null;

  @ApiProperty({
    example: 42,
    description: 'Number of votes for this choice',
    required: false,
  })
  voteCount?: number;

  @ApiProperty({
    example: 0,
    description: 'Display order of the choice',
  })
  order: number;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Media files for this choice',
    required: false,
  })
  media?: any[];

  constructor(data: Partial<PollChoiceResponseDto>) {
    Object.assign(this, data);
  }
}

export class PollResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Poll ID',
  })
  id: string;

  @ApiProperty({
    example: 'What is your favorite programming language?',
    description: 'Poll title',
  })
  title: string;

  @ApiProperty({
    example: 'Please select your preferred programming language',
    description: 'Poll description',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Creator user ID',
  })
  createdBy: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Organization ID',
    nullable: true,
  })
  organizationId: string | null;

  @ApiProperty({
    example: 'PUBLIC',
    description: 'Poll type',
    enum: PollType,
  })
  type: PollType;

  @ApiProperty({
    example: 'CLOSED',
    description: 'Result display type',
    enum: ResultDisplayType,
  })
  resultDisplayType: ResultDisplayType;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'Poll status',
    enum: PollStatus,
  })
  status: PollStatus;

  @ApiProperty({
    example: '2023-12-31T23:59:59Z',
    description: 'Voting end time',
  })
  votingEndsAt: Date;

  @ApiProperty({
    example: false,
    description: 'Allow multiple choices',
  })
  allowMultipleChoices: boolean;

  @ApiProperty({
    example: 'http://localhost:3000/uploads/poll-media/main-image.jpg',
    description: 'Main image URL for the poll',
    required: false,
  })
  mainImageUrl?: string;

  @ApiProperty({
    example: 'main-image.jpg',
    description: 'Main image filename',
    required: false,
  })
  mainImageFileName?: string;

  @ApiProperty({
    example: true,
    description: 'Is poll active',
  })
  isActive: boolean;

  @ApiProperty({
    example: true,
    description: 'Is voting currently active',
  })
  isVotingActive: boolean;

  @ApiProperty({
    example: false,
    description: 'Has voting ended',
  })
  isVotingEnded: boolean;

  @ApiProperty({
    example: false,
    description: 'Can view results',
  })
  canViewResults: boolean;

  @ApiProperty({
    type: [PollChoiceResponseDto],
    description: 'Poll choices',
  })
  choices: PollChoiceResponseDto[];

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Last update date',
  })
  updatedAt: Date;

  // User details (if included)
  @ApiProperty({
    description: 'Poll creator information',
    required: false,
  })
  creator?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };

  // Organization details (if included)
  @ApiProperty({
    description: 'Organization information',
    required: false,
  })
  organization?: {
    id: string;
    name: string;
    description: string | null;
  };

  constructor(data: Partial<PollResponseDto>) {
    Object.assign(this, data);
  }
}

export class ErrorResponseDto {
  @ApiProperty({
    example: 400,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Error message',
  })
  message: string;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Error type',
  })
  error: string;
}
