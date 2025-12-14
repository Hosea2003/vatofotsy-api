import { Inject, Injectable } from '@nestjs/common';
import type { OrganizationRepositoryPort, OrganizationValidationPort } from '../ports/organization.ports';
import { Organization } from '../../infrastructure/entities/organization.entity';
import { ORGANIZATION_REPOSITORY, ORGANIZATION_VALIDATION } from '../../organization.tokens';

@Injectable()
export class OrganizationDomainService {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: OrganizationRepositoryPort,
    @Inject(ORGANIZATION_VALIDATION)
    private readonly organizationValidation: OrganizationValidationPort,
  ) {}

  async createOrganization(
    name: string,
    description?: string,
    website?: string,
    email?: string,
    phone?: string,
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
      isActive: true,
    };

    return await this.organizationRepository.create(organizationData);
  }

  async updateOrganization(
    id: string,
    name?: string,
    description?: string,
    website?: string,
    email?: string,
    phone?: string,
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
    return await this.updateOrganization(id, undefined, undefined, undefined, undefined, undefined, true);
  }

  async deactivateOrganization(id: string): Promise<Organization> {
    return await this.updateOrganization(id, undefined, undefined, undefined, undefined, undefined, false);
  }
}
