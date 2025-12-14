import { Organization } from '../../infrastructure/entities/organization.entity';

export interface OrganizationRepositoryPort {
  create(organizationData: Partial<Organization>): Promise<Organization>;
  findById(id: string): Promise<Organization | null>;
  findByName(name: string): Promise<Organization | null>;
  findAll(): Promise<Organization[]>;
  update(id: string, updateData: Partial<Organization>): Promise<Organization>;
  delete(id: string): Promise<void>;
}

export interface OrganizationValidationPort {
  validateEmail(email: string): boolean;
  validateWebsite(website: string): boolean;
  validatePhone(phone: string): boolean;
}
