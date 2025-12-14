import { Injectable, Inject } from '@nestjs/common';
import { OrganizationDomainService } from '../../domain/services/organization-domain.service';

@Injectable()
export class CreateOrganizationUseCase {
  constructor(private readonly organizationDomainService: OrganizationDomainService) {}

  async execute(
    name: string,
    description?: string,
    website?: string,
    email?: string,
    phone?: string,
  ) {
    return await this.organizationDomainService.createOrganization(
      name,
      description,
      website,
      email,
      phone,
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
    isActive?: boolean,
  ) {
    return await this.organizationDomainService.updateOrganization(
      id,
      name,
      description,
      website,
      email,
      phone,
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
