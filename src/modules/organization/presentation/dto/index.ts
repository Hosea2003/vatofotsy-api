import { IsString, IsOptional, MinLength, MaxLength, IsEmail, IsUrl, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum OrganizationType {
  Group = 'Group',
  Team = 'Team',
  Organization = 'Organization',
  Enterprise = 'Enterprise',
}

export class CreateOrganizationDto {
  @ApiProperty({
    example: 'Acme Corporation',
    description: 'Organization name',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'A leading technology company',
    description: 'Organization description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: 'https://www.acme.com',
    description: 'Organization website',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    example: 'contact@acme.com',
    description: 'Organization email',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '+1 (555) 123-4567',
    description: 'Organization phone number',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({
    example: 'Group',
    description: 'Organization type based on size',
    enum: OrganizationType,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrganizationType)
  organizationType?: OrganizationType;
}

export class UpdateOrganizationDto {
  @ApiProperty({
    example: 'Acme Corporation Updated',
    description: 'Organization name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    example: 'An updated description',
    description: 'Organization description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: 'https://www.acme-updated.com',
    description: 'Organization website',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    example: 'new-contact@acme.com',
    description: 'Organization email',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '+1 (555) 987-6543',
    description: 'Organization phone number',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({
    example: 'Team',
    description: 'Organization type based on size',
    enum: OrganizationType,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrganizationType)
  organizationType?: OrganizationType;

  @ApiProperty({
    example: true,
    description: 'Organization active status',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class OrganizationResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Organization ID',
  })
  id: string;

  @ApiProperty({
    example: 'Acme Corporation',
    description: 'Organization name',
  })
  name: string;

  @ApiProperty({
    example: 'A leading technology company',
    description: 'Organization description',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: 'https://www.acme.com',
    description: 'Organization website',
    nullable: true,
  })
  website: string | null;

  @ApiProperty({
    example: 'contact@acme.com',
    description: 'Organization email',
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    example: '+1 (555) 123-4567',
    description: 'Organization phone number',
    nullable: true,
  })
  phone: string | null;

  @ApiProperty({
    example: 'Group',
    description: 'Organization type based on size (Group: <30, Team: 30-100, Organization: 100-1000, Enterprise: 1000+)',
    enum: OrganizationType,
  })
  organizationType: OrganizationType;

  @ApiProperty({
    example: true,
    description: 'Organization active status',
  })
  isActive: boolean;

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

  constructor(data: Partial<OrganizationResponseDto>) {
    Object.assign(this, data);
  }
}

// Re-export member DTOs
export * from './member.dto';

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
