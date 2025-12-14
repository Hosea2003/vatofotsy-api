import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MemberRole, InviteStatus } from '../../infrastructure/entities/organization-member.entity';

export class InviteUserDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID to invite',
  })
  @IsString()
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 'MEMBER',
    description: 'Role to assign to the user',
    enum: MemberRole,
  })
  @IsEnum(MemberRole)
  role: MemberRole;
}

export class UpdateMemberRoleDto {
  @ApiProperty({
    example: 'ADMIN',
    description: 'New role for the member',
    enum: MemberRole,
  })
  @IsEnum(MemberRole)
  role: MemberRole;
}

export class OrganizationMemberResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Member ID',
  })
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Organization ID',
  })
  organizationId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID',
  })
  userId: string;

  @ApiProperty({
    example: 'MEMBER',
    description: 'Member role',
    enum: MemberRole,
  })
  role: MemberRole;

  @ApiProperty({
    example: 'ACCEPTED',
    description: 'Invite status',
    enum: InviteStatus,
  })
  status: InviteStatus;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID who sent the invite',
    nullable: true,
  })
  invitedBy: string | null;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Invite date',
    nullable: true,
  })
  invitedAt: Date | null;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Join date',
    nullable: true,
  })
  joinedAt: Date | null;

  @ApiProperty({
    example: '2023-01-08T00:00:00Z',
    description: 'Invite expiration date',
    nullable: true,
  })
  expiresAt: Date | null;

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
    description: 'User information',
    required: false,
  })
  user?: {
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

  constructor(data: Partial<OrganizationMemberResponseDto>) {
    Object.assign(this, data);
  }
}
