import { Inject, Injectable } from '@nestjs/common';
import type { OrganizationRepositoryPort, OrganizationValidationPort, OrganizationMemberRepositoryPort } from '../ports/organization.ports';
import { Organization } from '../../infrastructure/entities/organization.entity';
import { MemberRole, InviteStatus } from '../../infrastructure/entities/organization-member.entity';
import { ORGANIZATION_REPOSITORY, ORGANIZATION_VALIDATION, ORGANIZATION_MEMBER_REPOSITORY } from '../../organization.tokens';

@Injectable()
export class OrganizationDomainService {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: OrganizationRepositoryPort,
    @Inject(ORGANIZATION_VALIDATION)
    private readonly organizationValidation: OrganizationValidationPort,
    @Inject(ORGANIZATION_MEMBER_REPOSITORY)
    private readonly memberRepository: OrganizationMemberRepositoryPort,
  ) {}

  async createOrganization(
    name: string,
    ownerId: string,
    description?: string,
    website?: string,
    email?: string,
    phone?: string,
    organizationType?: 'Group' | 'Team' | 'Organization' | 'Enterprise',
  ): Promise<Organization> {
    // Check if organization with same name already exists
    const existingOrganization = await this.organizationRepository.findByName(name);
    if (existingOrganization) {
      throw new Error('Organization with this name already exists');
    }

    // Validate email if provided
    if (email && !this.organizationValidation.validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Validate website if provided
    if (website && !this.organizationValidation.validateWebsite(website)) {
      throw new Error('Invalid website format');
    }

    // Validate phone if provided
    if (phone && !this.organizationValidation.validatePhone(phone)) {
      throw new Error('Invalid phone format');
    }

    const organizationData = {
      name,
      description,
      website,
      email,
      phone,
      organizationType: organizationType || 'Group',
      isActive: true,
    };

    const organization = await this.organizationRepository.create(organizationData);

    // Create owner membership
    await this.memberRepository.create({
      organizationId: organization.id,
      userId: ownerId,
      role: MemberRole.OWNER,
      status: InviteStatus.ACCEPTED,
      joinedAt: new Date(),
    });

    return organization;
  }

  async updateOrganization(
    id: string,
    name?: string,
    description?: string,
    website?: string,
    email?: string,
    phone?: string,
    organizationType?: 'Group' | 'Team' | 'Organization' | 'Enterprise',
    isActive?: boolean,
  ): Promise<Organization> {
    const organization = await this.organizationRepository.findById(id);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Check if name is being changed and if new name already exists
    if (name && name !== organization.name) {
      const existingOrganization = await this.organizationRepository.findByName(name);
      if (existingOrganization) {
        throw new Error('Organization with this name already exists');
      }
    }

    const updateData: Partial<Organization> = {};

    // Update fields if provided
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (website !== undefined) {
      if (website && !this.organizationValidation.validateWebsite(website)) {
        throw new Error('Invalid website format');
      }
      updateData.website = website;
    }
    if (email !== undefined) {
      if (email && !this.organizationValidation.validateEmail(email)) {
        throw new Error('Invalid email format');
      }
      updateData.email = email;
    }
    if (phone !== undefined) {
      if (phone && !this.organizationValidation.validatePhone(phone)) {
        throw new Error('Invalid phone format');
      }
      updateData.phone = phone;
    }
    if (organizationType !== undefined) updateData.organizationType = organizationType;
    if (isActive !== undefined) updateData.isActive = isActive;

    return await this.organizationRepository.update(id, updateData);
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    return await this.organizationRepository.findById(id);
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return await this.organizationRepository.findAll();
  }

  async deleteOrganization(id: string): Promise<void> {
    const organization = await this.organizationRepository.findById(id);
    if (!organization) {
      throw new Error('Organization not found');
    }

    await this.organizationRepository.delete(id);
  }

  async activateOrganization(id: string): Promise<Organization> {
    return await this.updateOrganization(id, undefined, undefined, undefined, undefined, undefined, undefined, true);
  }

  async deactivateOrganization(id: string): Promise<Organization> {
    return await this.updateOrganization(id, undefined, undefined, undefined, undefined, undefined, undefined, false);
  }

  // Member Management Methods
  async inviteUser(
    organizationId: string,
    userId: string,
    role: MemberRole,
    invitedBy: string,
  ) {
    // Check if organization exists
    const organization = await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Check if user is already a member or has pending invite
    const existingMember = await this.memberRepository.findByOrganizationAndUser(organizationId, userId);
    if (existingMember) {
      if (existingMember.status === InviteStatus.ACCEPTED) {
        throw new Error('User is already a member of this organization');
      }
      if (existingMember.status === InviteStatus.PENDING) {
        throw new Error('User already has a pending invite to this organization');
      }
    }

    // Create invite (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return await this.memberRepository.create({
      organizationId,
      userId,
      role,
      status: InviteStatus.PENDING,
      invitedBy,
      invitedAt: new Date(),
      expiresAt,
    });
  }

  async acceptInvite(inviteId: string, userId: string) {
    const invite = await this.memberRepository.findById(inviteId);
    if (!invite) {
      throw new Error('Invite not found');
    }

    if (invite.userId !== userId) {
      throw new Error('Unauthorized to accept this invite');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new Error('Invite is no longer pending');
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      // Mark as expired
      await this.memberRepository.update(inviteId, { status: InviteStatus.EXPIRED });
      throw new Error('Invite has expired');
    }

    return await this.memberRepository.update(inviteId, {
      status: InviteStatus.ACCEPTED,
      joinedAt: new Date(),
    });
  }

  async declineInvite(inviteId: string, userId: string) {
    const invite = await this.memberRepository.findById(inviteId);
    if (!invite) {
      throw new Error('Invite not found');
    }

    if (invite.userId !== userId) {
      throw new Error('Unauthorized to decline this invite');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new Error('Invite is no longer pending');
    }

    return await this.memberRepository.update(inviteId, {
      status: InviteStatus.DECLINED,
    });
  }

  async getOrganizationMembers(organizationId: string) {
    return await this.memberRepository.findByOrganizationId(organizationId);
  }

  async getUserOrganizations(userId: string) {
    return await this.memberRepository.findByUserId(userId);
  }

  async getPendingInvites(userId: string) {
    return await this.memberRepository.findPendingInvites(userId);
  }

  async removeMember(organizationId: string, userId: string, removedBy: string) {
    const member = await this.memberRepository.findByOrganizationAndUser(organizationId, userId);
    if (!member) {
      throw new Error('Member not found');
    }

    if (member.role === MemberRole.OWNER) {
      throw new Error('Cannot remove the organization owner');
    }

    // Check if the person removing has permission (must be OWNER or ADMIN)
    const remover = await this.memberRepository.findByOrganizationAndUser(organizationId, removedBy);
    if (!remover || (remover.role !== MemberRole.OWNER && remover.role !== MemberRole.ADMIN)) {
      throw new Error('Insufficient permissions to remove member');
    }

    await this.memberRepository.delete(member.id);
  }

  async updateMemberRole(organizationId: string, userId: string, newRole: MemberRole, updatedBy: string) {
    const member = await this.memberRepository.findByOrganizationAndUser(organizationId, userId);
    if (!member) {
      throw new Error('Member not found');
    }

    if (member.role === MemberRole.OWNER && newRole !== MemberRole.OWNER) {
      throw new Error('Cannot change the role of the organization owner');
    }

    // Check permissions
    const updater = await this.memberRepository.findByOrganizationAndUser(organizationId, updatedBy);
    if (!updater || updater.role !== MemberRole.OWNER) {
      throw new Error('Only organization owners can update member roles');
    }

    return await this.memberRepository.update(member.id, { role: newRole });
  }
}
