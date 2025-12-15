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
  UnauthorizedException,
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
  InviteUserToOrganizationUseCase,
  AcceptOrganizationInviteUseCase,
  DeclineOrganizationInviteUseCase,
  GetOrganizationMembersUseCase,
  GetUserOrganizationsUseCase,
  GetPendingInvitesUseCase,
  RemoveOrganizationMemberUseCase,
  UpdateMemberRoleUseCase,
} from '../../application/use-cases/organization.use-cases';
import {
  InviteUserDto,
  UpdateMemberRoleDto,
  OrganizationMemberResponseDto,
  ErrorResponseDto,
} from '../dto';
import { CurrentUser } from '../../../auth';
import type { AuthenticatedUser } from '../../../auth';

@ApiTags('organization-members')
@ApiBearerAuth('JWT-auth')
@Controller('organizations/:organizationId/members')
export class OrganizationMemberController {
  constructor(
    private readonly inviteUserUseCase: InviteUserToOrganizationUseCase,
    private readonly acceptInviteUseCase: AcceptOrganizationInviteUseCase,
    private readonly declineInviteUseCase: DeclineOrganizationInviteUseCase,
    private readonly getOrganizationMembersUseCase: GetOrganizationMembersUseCase,
    private readonly getUserOrganizationsUseCase: GetUserOrganizationsUseCase,
    private readonly getPendingInvitesUseCase: GetPendingInvitesUseCase,
    private readonly removeMemberUseCase: RemoveOrganizationMemberUseCase,
    private readonly updateMemberRoleUseCase: UpdateMemberRoleUseCase,
  ) {}

  @Post('invite')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Invite a user to the organization' })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User invited successfully.',
    type: OrganizationMemberResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User is already a member or has pending invite.',
    type: ErrorResponseDto,
  })
  async inviteUser(
    @Param('organizationId') organizationId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() inviteUserDto: InviteUserDto,
  ): Promise<OrganizationMemberResponseDto> {
    try {
      const member = await this.inviteUserUseCase.execute(
        organizationId,
        inviteUserDto.userId,
        inviteUserDto.role,
        user.userId,
      );

      return new OrganizationMemberResponseDto({
        id: member.id,
        organizationId: member.organizationId,
        userId: member.userId,
        role: member.role,
        status: member.status,
        invitedBy: member.invitedBy,
        invitedAt: member.invitedAt,
        joinedAt: member.joinedAt,
        expiresAt: member.expiresAt,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      });
    } catch (error) {
      if (error.message === 'Organization not found') {
        throw new NotFoundException('Organization not found');
      }
      if (
        error.message === 'User is already a member of this organization' ||
        error.message === 'User already has a pending invite to this organization'
      ) {
        throw new ConflictException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all members of the organization' })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of organization members.',
    type: [OrganizationMemberResponseDto],
  })
  async getOrganizationMembers(
    @Param('organizationId') organizationId: string,
  ): Promise<OrganizationMemberResponseDto[]> {
    const members = await this.getOrganizationMembersUseCase.execute(organizationId);

    return members.map(member => new OrganizationMemberResponseDto({
      id: member.id,
      organizationId: member.organizationId,
      userId: member.userId,
      role: member.role,
      status: member.status,
      invitedBy: member.invitedBy,
      invitedAt: member.invitedAt,
      joinedAt: member.joinedAt,
      expiresAt: member.expiresAt,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      user: member.user ? {
        id: member.user.id,
        email: member.user.email,
        firstName: member.user.firstName,
        lastName: member.user.lastName,
      } : undefined,
    }));
  }

  @Put(':userId/role')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Update member role' })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Member role updated successfully.',
    type: OrganizationMemberResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Member not found.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Insufficient permissions.',
    type: ErrorResponseDto,
  })
  async updateMemberRole(
    @Param('organizationId') organizationId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto,
  ): Promise<OrganizationMemberResponseDto> {
    try {
      const member = await this.updateMemberRoleUseCase.execute(
        organizationId,
        userId,
        updateMemberRoleDto.role,
        user.userId,
      );

      return new OrganizationMemberResponseDto({
        id: member.id,
        organizationId: member.organizationId,
        userId: member.userId,
        role: member.role,
        status: member.status,
        invitedBy: member.invitedBy,
        invitedAt: member.invitedAt,
        joinedAt: member.joinedAt,
        expiresAt: member.expiresAt,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      });
    } catch (error) {
      if (error.message === 'Member not found') {
        throw new NotFoundException('Member not found');
      }
      if (error.message === 'Only organization owners can update member roles') {
        throw new UnauthorizedException('Only organization owners can update member roles');
      }
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove member from organization' })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Member removed successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Member not found.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Insufficient permissions.',
    type: ErrorResponseDto,
  })
  async removeMember(
    @Param('organizationId') organizationId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    try {
      await this.removeMemberUseCase.execute(organizationId, userId, user.userId);
    } catch (error) {
      if (error.message === 'Member not found') {
        throw new NotFoundException('Member not found');
      }
      if (error.message === 'Insufficient permissions to remove member') {
        throw new UnauthorizedException('Insufficient permissions to remove member');
      }
      if (error.message === 'Cannot remove the organization owner') {
        throw new BadRequestException('Cannot remove the organization owner');
      }
      throw new BadRequestException(error.message);
    }
  }
}

@ApiTags('user-organizations')
@ApiBearerAuth('JWT-auth')
@Controller('users/me/organizations')
export class UserOrganizationController {
  constructor(
    private readonly getUserOrganizationsUseCase: GetUserOrganizationsUseCase,
    private readonly getPendingInvitesUseCase: GetPendingInvitesUseCase,
    private readonly acceptInviteUseCase: AcceptOrganizationInviteUseCase,
    private readonly declineInviteUseCase: DeclineOrganizationInviteUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user organizations' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of user organizations.',
    type: [OrganizationMemberResponseDto],
  })
  async getUserOrganizations(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrganizationMemberResponseDto[]> {
    const memberships = await this.getUserOrganizationsUseCase.execute(user.userId);

    return memberships.map(membership => new OrganizationMemberResponseDto({
      id: membership.id,
      organizationId: membership.organizationId,
      userId: membership.userId,
      role: membership.role,
      status: membership.status,
      invitedBy: membership.invitedBy,
      invitedAt: membership.invitedAt,
      joinedAt: membership.joinedAt,
      expiresAt: membership.expiresAt,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
      organization: membership.organization ? {
        id: membership.organization.id,
        name: membership.organization.name,
        description: membership.organization.description,
      } : undefined,
    }));
  }

  @Get('invites')
  @ApiOperation({ summary: 'Get pending invites' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of pending invites.',
    type: [OrganizationMemberResponseDto],
  })
  async getPendingInvites(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrganizationMemberResponseDto[]> {
    const invites = await this.getPendingInvitesUseCase.execute(user.userId);

    return invites.map(invite => new OrganizationMemberResponseDto({
      id: invite.id,
      organizationId: invite.organizationId,
      userId: invite.userId,
      role: invite.role,
      status: invite.status,
      invitedBy: invite.invitedBy,
      invitedAt: invite.invitedAt,
      joinedAt: invite.joinedAt,
      expiresAt: invite.expiresAt,
      createdAt: invite.createdAt,
      updatedAt: invite.updatedAt,
      organization: invite.organization ? {
        id: invite.organization.id,
        name: invite.organization.name,
        description: invite.organization.description,
      } : undefined,
    }));
  }

  @Put('invites/:inviteId/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept organization invite' })
  @ApiParam({
    name: 'inviteId',
    description: 'Invite ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invite accepted successfully.',
    type: OrganizationMemberResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invite not found.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invite is no longer valid.',
    type: ErrorResponseDto,
  })
  async acceptInvite(
    @Param('inviteId') inviteId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrganizationMemberResponseDto> {
    try {
      const member = await this.acceptInviteUseCase.execute(inviteId, user.userId);

      return new OrganizationMemberResponseDto({
        id: member.id,
        organizationId: member.organizationId,
        userId: member.userId,
        role: member.role,
        status: member.status,
        invitedBy: member.invitedBy,
        invitedAt: member.invitedAt,
        joinedAt: member.joinedAt,
        expiresAt: member.expiresAt,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      });
    } catch (error) {
      if (error.message === 'Invite not found') {
        throw new NotFoundException('Invite not found');
      }
      if (error.message === 'Unauthorized to accept this invite') {
        throw new UnauthorizedException('Unauthorized to accept this invite');
      }
      throw new BadRequestException(error.message);
    }
  }

  @Put('invites/:inviteId/decline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Decline organization invite' })
  @ApiParam({
    name: 'inviteId',
    description: 'Invite ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invite declined successfully.',
    type: OrganizationMemberResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invite not found.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invite is no longer valid.',
    type: ErrorResponseDto,
  })
  async declineInvite(
    @Param('inviteId') inviteId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrganizationMemberResponseDto> {
    try {
      const member = await this.declineInviteUseCase.execute(inviteId, user.userId);

      return new OrganizationMemberResponseDto({
        id: member.id,
        organizationId: member.organizationId,
        userId: member.userId,
        role: member.role,
        status: member.status,
        invitedBy: member.invitedBy,
        invitedAt: member.invitedAt,
        joinedAt: member.joinedAt,
        expiresAt: member.expiresAt,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      });
    } catch (error) {
      if (error.message === 'Invite not found') {
        throw new NotFoundException('Invite not found');
      }
      if (error.message === 'Unauthorized to decline this invite') {
        throw new UnauthorizedException('Unauthorized to decline this invite');
      }
      throw new BadRequestException(error.message);
    }
  }
}
