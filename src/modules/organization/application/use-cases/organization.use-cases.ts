import { Injectable, Inject } from '@nestjs/common';
import { OrganizationDomainService } from '../../domain/services/organization-domain.service';
import { MemberRole } from '../../infrastructure/entities/organization-member.entity';

@Injectable()
export class CreateOrganizationUseCase {
  constructor(private readonly organizationDomainService: OrganizationDomainService) {}

  async execute(
    name: string,
    ownerId: string,
    description?: string,
    website?: string,
    email?: string,
    phone?: string,
    organizationType?: 'Group' | 'Team' | 'Organization' | 'Enterprise',
  ) {
    return await this.organizationDomainService.createOrganization(
      name,
      ownerId,
      description,
      website,
      email,
      phone,
      organizationType,
    );
  }
}

@Injectable()
export class GetOrganizationByIdUseCase {
  constructor(private readonly organizationDomainService: OrganizationDomainService) {}

  async execute(id: string) {
    const organization = await this.organizationDomainService.getOrganizationById(id);
    if (!organization) {
      throw new Error('Organization not found');
    }
    return organization;
  }
}

@Injectable()
export class GetAllOrganizationsUseCase {
  constructor(private readonly organizationDomainService: OrganizationDomainService) {}

  async execute() {
    return await this.organizationDomainService.getAllOrganizations();
  }
}

@Injectable()
export class UpdateOrganizationUseCase {
  constructor(private readonly organizationDomainService: OrganizationDomainService) {}

  async execute(
    id: string,
    name?: string,
    description?: string,
    website?: string,
    email?: string,
    phone?: string,
    organizationType?: 'Group' | 'Team' | 'Organization' | 'Enterprise',
    isActive?: boolean,
  ) {
    return await this.organizationDomainService.updateOrganization(
      id,
      name,
      description,
      website,
      email,
      phone,
      organizationType,
      isActive,
    );
  }
}

@Injectable()
export class DeleteOrganizationUseCase {
  constructor(private readonly organizationDomainService: OrganizationDomainService) {}

  async execute(id: string): Promise<void> {
    await this.organizationDomainService.deleteOrganization(id);
  }
}

// Member Use Cases
@Injectable()
export class InviteUserToOrganizationUseCase {
  constructor(private readonly organizationDomainService: OrganizationDomainService) {}

  async execute(organizationId: string, userId: string, role: MemberRole, invitedBy: string) {
    return await this.organizationDomainService.inviteUser(organizationId, userId, role, invitedBy);
  }
}

@Injectable()
export class AcceptOrganizationInviteUseCase {
  constructor(private readonly organizationDomainService: OrganizationDomainService) {}

  async execute(inviteId: string, userId: string) {
    return await this.organizationDomainService.acceptInvite(inviteId, userId);
  }
}

@Injectable()
export class DeclineOrganizationInviteUseCase {
  constructor(private readonly organizationDomainService: OrganizationDomainService) {}

  async execute(inviteId: string, userId: string) {
    return await this.organizationDomainService.declineInvite(inviteId, userId);
  }
}

@Injectable()
export class GetOrganizationMembersUseCase {
  constructor(private readonly organizationDomainService: OrganizationDomainService) {}

  async execute(organizationId: string) {
    return await this.organizationDomainService.getOrganizationMembers(organizationId);
  }
}

@Injectable()
export class GetUserOrganizationsUseCase {
  constructor(private readonly organizationDomainService: OrganizationDomainService) {}

  async execute(userId: string) {
    return await this.organizationDomainService.getUserOrganizations(userId);
  }
}

@Injectable()
export class GetPendingInvitesUseCase {
  constructor(private readonly organizationDomainService: OrganizationDomainService) {}

  async execute(userId: string) {
    return await this.organizationDomainService.getPendingInvites(userId);
  }
}

@Injectable()
export class RemoveOrganizationMemberUseCase {
  constructor(private readonly organizationDomainService: OrganizationDomainService) {}

  async execute(organizationId: string, userId: string, removedBy: string) {
    await this.organizationDomainService.removeMember(organizationId, userId, removedBy);
  }
}

@Injectable()
export class UpdateMemberRoleUseCase {
  constructor(private readonly organizationDomainService: OrganizationDomainService) {}

  async execute(organizationId: string, userId: string, newRole: MemberRole, updatedBy: string) {
    return await this.organizationDomainService.updateMemberRole(organizationId, userId, newRole, updatedBy);
  }
}
