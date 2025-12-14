import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
}

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
  })
  file: any;
}

export class UploadMultipleFilesDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Files to upload',
  })
  files: any[];
}

export class FileUploadResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000.jpg' })
  fileName: string;

  @ApiProperty({ example: 'my-image.jpg' })
  originalName: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;

  @ApiProperty({ example: 1024000 })
  size: number;

  @ApiProperty({ example: 'http://localhost:3000/uploads/poll-media/123e4567-e89b-12d3-a456-426614174000.jpg' })
  url: string;

  constructor(data: Partial<FileUploadResponseDto>) {
    Object.assign(this, data);
  }
}

export class AddChoiceMediaDto {
  @ApiProperty({
    description: 'Poll choice ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  choiceId: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Media files to add to the choice',
  })
  files: any[];
}

export class UpdatePollMainImageDto {
  @ApiProperty({
    description: 'Poll ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  pollId: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Main image file for the poll',
  })
  file: any;
}

export class PollChoiceMediaResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000.jpg' })
  fileName: string;

  @ApiProperty({ example: 'my-image.jpg' })
  originalName: string;

  @ApiProperty({ example: 'http://localhost:3000/uploads/poll-media/123e4567-e89b-12d3-a456-426614174000.jpg' })
  url: string;

  @ApiProperty({ enum: MediaType, example: MediaType.IMAGE })
  mediaType: MediaType;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;

  @ApiProperty({ example: 1024000 })
  size: number;

  @ApiProperty({ example: 0 })
  order: number;

  @ApiProperty({ example: '2023-12-14T10:00:00.000Z' })
  createdAt: Date;

  constructor(data: Partial<PollChoiceMediaResponseDto>) {
    Object.assign(this, data);
  }
}
