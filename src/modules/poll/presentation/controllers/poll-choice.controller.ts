import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  HttpStatus,
  HttpCode,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../auth';
import type { AuthenticatedUser } from '../../../auth';
import { LocalFileUploadService } from '../../infrastructure/adapters/local-file-upload.service';
import { PollChoiceService } from '../../application/services/poll-choice.service';
import {
  CreatePollChoiceDto,
  UpdatePollChoiceDto,
  PollChoiceResponseDto,
  PollChoiceMediaResponseDto,
  ErrorResponseDto,
} from '../dto';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@ApiTags('poll-choices')
@ApiBearerAuth('JWT-auth')
@Controller('polls/:pollId/choices')
export class PollChoiceController {
  constructor(
    private readonly pollChoiceService: PollChoiceService,
    private readonly fileUploadService: LocalFileUploadService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 5)) // Max 5 files per choice
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Add a new choice to a poll with optional media files' })
  @ApiParam({
    name: 'pollId',
    description: 'Poll ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Poll choice data with optional files',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Choice name',
          example: 'Option A',
        },
        description: {
          type: 'string',
          description: 'Choice description',
          example: 'This is option A',
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Media files for this choice',
        },
      },
      required: ['name'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Choice added successfully.',
    type: PollChoiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or file validation failed.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Poll not found.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Only poll creator can add choices.',
    type: ErrorResponseDto,
  })
  async addChoice(
    @Param('pollId') pollId: string,
    @Body() createChoiceDto: CreatePollChoiceDto,
    @UploadedFiles() files: MulterFile[],
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PollChoiceResponseDto> {
    try {
      // Validate files if provided
      if (files && files.length > 0) {
        const uploadedFiles = files.map(file => ({
          fieldname: file.fieldname,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          buffer: file.buffer,
          size: file.size,
        }));

        const validation = this.fileUploadService.validateMultipleFiles(uploadedFiles);
        if (!validation.isValid) {
          throw new BadRequestException(`File validation failed: ${validation.errors.join(', ')}`);
        }
      }

      const choice = await this.pollChoiceService.addChoiceToPoll(
        pollId,
        createChoiceDto.name,
        user.userId,
        createChoiceDto.description,
        files || [],
      );

      return new PollChoiceResponseDto({
        id: choice.id,
        name: choice.name,
        description: choice.description,
        mediaUrl: choice.mediaUrl,
        mediaType: choice.mediaType,
        mediaFileName: choice.mediaFileName,
        order: choice.order,
        createdAt: choice.createdAt,
        media: choice.media?.map(media => new PollChoiceMediaResponseDto({
          id: media.id,
          fileName: media.fileName,
          originalName: media.originalName,
          url: media.url,
          mediaType: media.mediaType,
          mimeType: media.mimeType,
          size: media.size,
          order: media.order,
          createdAt: media.createdAt,
        })) || [],
      });
    } catch (error) {
      if (error.message === 'Poll not found') {
        throw new NotFoundException('Poll not found');
      }
      if (error.message === 'Only poll creator can add choices') {
        throw new UnauthorizedException('Only poll creator can add choices');
      }
      if (error.message === 'Cannot add choices to active or ended polls') {
        throw new BadRequestException('Cannot add choices to active or ended polls');
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all choices for a poll' })
  @ApiParam({
    name: 'pollId',
    description: 'Poll ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Poll choices retrieved successfully.',
    type: [PollChoiceResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Poll not found.',
    type: ErrorResponseDto,
  })
  async getChoices(
    @Param('pollId') pollId: string,
  ): Promise<PollChoiceResponseDto[]> {
    try {
      const choices = await this.pollChoiceService.getChoicesByPoll(pollId);

      return choices.map(choice => new PollChoiceResponseDto({
        id: choice.id,
        name: choice.name,
        description: choice.description,
        mediaUrl: choice.mediaUrl,
        mediaType: choice.mediaType,
        mediaFileName: choice.mediaFileName,
        order: choice.order,
        createdAt: choice.createdAt,
        media: choice.media?.map(media => new PollChoiceMediaResponseDto({
          id: media.id,
          fileName: media.fileName,
          originalName: media.originalName,
          url: media.url,
          mediaType: media.mediaType,
          mimeType: media.mimeType,
          size: media.size,
          order: media.order,
          createdAt: media.createdAt,
        })) || [],
      }));
    } catch (error) {
      if (error.message === 'Poll not found') {
        throw new NotFoundException('Poll not found');
      }
      throw error;
    }
  }

  @Put(':choiceId')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Update a poll choice' })
  @ApiParam({
    name: 'pollId',
    description: 'Poll ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'choiceId',
    description: 'Choice ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Choice updated successfully.',
    type: PollChoiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Poll or choice not found.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Only poll creator can update choices.',
    type: ErrorResponseDto,
  })
  async updateChoice(
    @Param('pollId') pollId: string,
    @Param('choiceId') choiceId: string,
    @Body() updateChoiceDto: UpdatePollChoiceDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PollChoiceResponseDto> {
    try {
      const choice = await this.pollChoiceService.updateChoice(
        choiceId,
        user.userId,
        updateChoiceDto.name,
        updateChoiceDto.description,
      );

      return new PollChoiceResponseDto({
        id: choice.id,
        name: choice.name,
        description: choice.description,
        mediaUrl: choice.mediaUrl,
        mediaType: choice.mediaType,
        mediaFileName: choice.mediaFileName,
        order: choice.order,
        createdAt: choice.createdAt,
        media: choice.media?.map(media => new PollChoiceMediaResponseDto({
          id: media.id,
          fileName: media.fileName,
          originalName: media.originalName,
          url: media.url,
          mediaType: media.mediaType,
          mimeType: media.mimeType,
          size: media.size,
          order: media.order,
          createdAt: media.createdAt,
        })) || [],
      });
    } catch (error) {
      if (error.message === 'Choice not found') {
        throw new NotFoundException('Choice not found');
      }
      if (error.message === 'Only poll creator can update choices') {
        throw new UnauthorizedException('Only poll creator can update choices');
      }
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':choiceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a poll choice' })
  @ApiParam({
    name: 'pollId',
    description: 'Poll ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'choiceId',
    description: 'Choice ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Choice deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Poll or choice not found.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Only poll creator can delete choices.',
    type: ErrorResponseDto,
  })
  async deleteChoice(
    @Param('pollId') pollId: string,
    @Param('choiceId') choiceId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    try {
      await this.pollChoiceService.deleteChoice(choiceId, user.userId);
    } catch (error) {
      if (error.message === 'Choice not found') {
        throw new NotFoundException('Choice not found');
      }
      if (error.message === 'Only poll creator can delete choices') {
        throw new UnauthorizedException('Only poll creator can delete choices');
      }
      throw new BadRequestException(error.message);
    }
  }
}
