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
  ConflictException,
  NotFoundException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateOrganizationUseCase,
  GetOrganizationByIdUseCase,
  GetAllOrganizationsUseCase,
  UpdateOrganizationUseCase,
  DeleteOrganizationUseCase,
} from '../../application/use-cases/organization.use-cases';
import { Public, CurrentUser } from '../../../auth';
import type { AuthenticatedUser } from '../../../auth';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationResponseDto,
  ErrorResponseDto,
  OrganizationType,
} from '../dto';

@ApiTags('organizations')
@ApiBearerAuth('JWT-auth')
@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly getOrganizationByIdUseCase: GetOrganizationByIdUseCase,
    private readonly getAllOrganizationsUseCase: GetAllOrganizationsUseCase,
    private readonly updateOrganizationUseCase: UpdateOrganizationUseCase,
    private readonly deleteOrganizationUseCase: DeleteOrganizationUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Organization has been successfully created.',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Organization with this name already exists.',
    type: ErrorResponseDto,
  })
  async createOrganization(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    try {
      const organization = await this.createOrganizationUseCase.execute(
        createOrganizationDto.name,
        user.userId,
        createOrganizationDto.description,
        createOrganizationDto.website,
        createOrganizationDto.email,
        createOrganizationDto.phone,
        createOrganizationDto.organizationType,
      );

      return new OrganizationResponseDto({
        id: organization.id,
        name: organization.name,
        description: organization.description,
        website: organization.website,
        email: organization.email,
        phone: organization.phone,
        organizationType: organization.organizationType as OrganizationType,
        isActive: organization.isActive,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      });
    } catch (error) {
      if (error.message === 'Organization with this name already exists') {
        throw new ConflictException('Organization with this name already exists');
      }
      if (
        error.message === 'Invalid email format' ||
        error.message === 'Invalid website format' ||
        error.message === 'Invalid phone format'
      ) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all organizations.',
    type: [OrganizationResponseDto],
  })
  async getAllOrganizations(): Promise<OrganizationResponseDto[]> {
    const organizations = await this.getAllOrganizationsUseCase.execute();

    return organizations.map(organization => new OrganizationResponseDto({
      id: organization.id,
      name: organization.name,
      description: organization.description,
      website: organization.website,
      email: organization.email,
      phone: organization.phone,
      organizationType: organization.organizationType as OrganizationType,
      isActive: organization.isActive,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiParam({
    name: 'id',
    description: 'Organization ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Organization found.',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organization not found.',
    type: ErrorResponseDto,
  })
  async getOrganizationById(@Param('id') id: string): Promise<OrganizationResponseDto> {
    try {
      const organization = await this.getOrganizationByIdUseCase.execute(id);

      return new OrganizationResponseDto({
        id: organization.id,
        name: organization.name,
        description: organization.description,
        website: organization.website,
        email: organization.email,
        phone: organization.phone,
        organizationType: organization.organizationType as OrganizationType,
        isActive: organization.isActive,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      });
    } catch (error) {
      if (error.message === 'Organization not found') {
        throw new NotFoundException('Organization not found');
      }
      throw error;
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Update organization by ID' })
  @ApiParam({
    name: 'id',
    description: 'Organization ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Organization updated successfully.',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organization not found.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Organization with this name already exists.',
    type: ErrorResponseDto,
  })
  async updateOrganization(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    try {
      const organization = await this.updateOrganizationUseCase.execute(
        id,
        updateOrganizationDto.name,
        updateOrganizationDto.description,
        updateOrganizationDto.website,
        updateOrganizationDto.email,
        updateOrganizationDto.phone,
        updateOrganizationDto.organizationType,
        updateOrganizationDto.isActive,
      );

      return new OrganizationResponseDto({
        id: organization.id,
        name: organization.name,
        description: organization.description,
        website: organization.website,
        email: organization.email,
        phone: organization.phone,
        organizationType: organization.organizationType as OrganizationType,
        isActive: organization.isActive,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      });
    } catch (error) {
      if (error.message === 'Organization not found') {
        throw new NotFoundException('Organization not found');
      }
      if (error.message === 'Organization with this name already exists') {
        throw new ConflictException('Organization with this name already exists');
      }
      if (
        error.message === 'Invalid email format' ||
        error.message === 'Invalid website format' ||
        error.message === 'Invalid phone format'
      ) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete organization by ID' })
  @ApiParam({
    name: 'id',
    description: 'Organization ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Organization deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organization not found.',
    type: ErrorResponseDto,
  })
  async deleteOrganization(@Param('id') id: string): Promise<void> {
    try {
      await this.deleteOrganizationUseCase.execute(id);
    } catch (error) {
      if (error.message === 'Organization not found') {
        throw new NotFoundException('Organization not found');
      }
      throw error;
    }
  }
}
