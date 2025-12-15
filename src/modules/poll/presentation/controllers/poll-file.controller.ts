import {
  Controller,
  Post,
  Put,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LocalFileUploadService } from '../../infrastructure/adapters/local-file-upload.service';
import { PollChoiceMediaService } from '../../application/services/poll-choice-media.service';
import {
  UploadFileDto,
  UploadMultipleFilesDto,
  FileUploadResponseDto,
  AddChoiceMediaDto,
  UpdatePollMainImageDto,
  PollChoiceMediaResponseDto,
  ErrorResponseDto,
} from '../dto';
import { CurrentUser } from '../../../auth';
import type { AuthenticatedUser } from '../../../auth';
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@ApiTags('poll-files')
@ApiBearerAuth('JWT-auth')
@Controller('polls')
export class PollFileController {
  constructor(
    private readonly fileUploadService: LocalFileUploadService,
    private readonly pollChoiceMediaService: PollChoiceMediaService,
  ) {}

  @Post('upload/single')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File uploaded successfully.',
    type: FileUploadResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file or file validation failed.',
    type: ErrorResponseDto,
  })
  async uploadSingleFile(
    @UploadedFile() file: MulterFile,
  ): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const uploadedFile = {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    };

    // Validate file
    const validation = this.fileUploadService.validateFile(uploadedFile);
    if (!validation.isValid) {
      throw new BadRequestException(validation.error);
    }

    const result = await this.fileUploadService.uploadSingleFile(uploadedFile);
    
    return new FileUploadResponseDto(result);
  }

  @Post('upload/multiple')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadMultipleFilesDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Files uploaded successfully.',
    type: [FileUploadResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid files or file validation failed.',
    type: ErrorResponseDto,
  })
  async uploadMultipleFiles(
    @UploadedFiles() files: MulterFile[],
  ): Promise<FileUploadResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadedFiles = files.map(file => ({
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    }));

    // Validate files
    const validation = this.fileUploadService.validateMultipleFiles(uploadedFiles);
    if (!validation.isValid) {
      throw new BadRequestException(`File validation failed: ${validation.errors.join(', ')}`);
    }

    const results = await this.fileUploadService.uploadMultipleFiles(uploadedFiles);
    
    return results.map(result => new FileUploadResponseDto(result));
  }

  @Post('choices/:choiceId/media')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 5)) // Max 5 files per choice
  @ApiOperation({ summary: 'Add media files to a poll choice' })
  @ApiParam({
    name: 'choiceId',
    description: 'Poll choice ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: AddChoiceMediaDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Media files added to choice successfully.',
    type: [PollChoiceMediaResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Poll choice not found.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Only poll creator can add media to choices.',
    type: ErrorResponseDto,
  })
  async addChoiceMedia(
    @Param('choiceId') choiceId: string,
    @UploadedFiles() files: MulterFile[],
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PollChoiceMediaResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    try {
      const uploadedFiles = files.map(file => ({
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        buffer: file.buffer,
        size: file.size,
      }));

      // Validate files
      const validation = this.fileUploadService.validateMultipleFiles(uploadedFiles);
      if (!validation.isValid) {
        throw new BadRequestException(`File validation failed: ${validation.errors.join(', ')}`);
      }

      const mediaItems = await this.pollChoiceMediaService.addMediaToChoice(
        choiceId,
        uploadedFiles,
        user.userId,
      );

      return mediaItems.map(media => new PollChoiceMediaResponseDto({
        id: media.id,
        fileName: media.fileName,
        originalName: media.originalName,
        url: media.url,
        mediaType: media.mediaType,
        mimeType: media.mimeType,
        size: media.size,
        order: media.order,
        createdAt: media.createdAt,
      }));
    } catch (error) {
      if (error.message === 'Poll choice not found') {
        throw new NotFoundException('Poll choice not found');
      }
      if (error.message === 'Only poll creator can add media to choices') {
        throw new UnauthorizedException('Only poll creator can add media to choices');
      }
      throw new BadRequestException(error.message);
    }
  }

  @Put(':pollId/main-image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Update poll main image' })
  @ApiParam({
    name: 'pollId',
    description: 'Poll ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdatePollMainImageDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Poll main image updated successfully.',
    type: FileUploadResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Poll not found.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Only poll creator can update main image.',
    type: ErrorResponseDto,
  })
  async updatePollMainImage(
    @Param('pollId') pollId: string,
    @UploadedFile() file: MulterFile,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const uploadedFile = {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    };

    // Only allow image files for main image
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed for main image');
    }

    const validation = this.fileUploadService.validateFile(uploadedFile);
    if (!validation.isValid) {
      throw new BadRequestException(validation.error);
    }

    try {
      const result = await this.pollChoiceMediaService.updatePollMainImage(
        pollId,
        uploadedFile,
        user.userId,
      );

      return new FileUploadResponseDto(result);
    } catch (error) {
      if (error.message === 'Poll not found') {
        throw new NotFoundException('Poll not found');
      }
      if (error.message === 'Only poll creator can update main image') {
        throw new UnauthorizedException('Only poll creator can update main image');
      }
      throw new BadRequestException(error.message);
    }
  }

  @Delete('media/:mediaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete poll choice media' })
  @ApiParam({
    name: 'mediaId',
    description: 'Poll choice media ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Media deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Media not found.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Only poll creator can delete media.',
    type: ErrorResponseDto,
  })
  async deleteChoiceMedia(
    @Param('mediaId') mediaId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    try {
      await this.pollChoiceMediaService.deleteMedia(mediaId, user.userId);
    } catch (error) {
      if (error.message === 'Media not found') {
        throw new NotFoundException('Media not found');
      }
      if (error.message === 'Only poll creator can delete media') {
        throw new UnauthorizedException('Only poll creator can delete media');
      }
      throw new BadRequestException(error.message);
    }
  }
}
