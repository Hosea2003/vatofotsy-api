import { Organization } from '../../infrastructure/entities/organization.entity';
import { OrganizationMember, MemberRole, InviteStatus } from '../../infrastructure/entities/organization-member.entity';

export interface OrganizationRepositoryPort {
  create(organizationData: Partial<Organization>): Promise<Organization>;
  findById(id: string): Promise<Organization | null>;
  findByName(name: string): Promise<Organization | null>;
  findAll(): Promise<Organization[]>;
  update(id: string, updateData: Partial<Organization>): Promise<Organization>;
  delete(id: string): Promise<void>;
}

export interface OrganizationMemberRepositoryPort {
  create(memberData: Partial<OrganizationMember>): Promise<OrganizationMember>;
  findById(id: string): Promise<OrganizationMember | null>;
  findByOrganizationAndUser(organizationId: string, userId: string): Promise<OrganizationMember | null>;
  findByOrganizationId(organizationId: string): Promise<OrganizationMember[]>;
  findByUserId(userId: string): Promise<OrganizationMember[]>;
  findPendingInvites(userId: string): Promise<OrganizationMember[]>;
  update(id: string, updateData: Partial<OrganizationMember>): Promise<OrganizationMember>;
  delete(id: string): Promise<void>;
}

export interface OrganizationValidationPort {
  validateEmail(email: string): boolean;
  validateWebsite(website: string): boolean;
  validatePhone(phone: string): boolean;
}
