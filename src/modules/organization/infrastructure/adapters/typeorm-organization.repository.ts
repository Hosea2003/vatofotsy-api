import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import type { OrganizationRepositoryPort } from '../../domain/ports/organization.ports';

@Injectable()
export class TypeOrmOrganizationRepository implements OrganizationRepositoryPort {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async create(organizationData: Partial<Organization>): Promise<Organization> {
    const organization = this.organizationRepository.create(organizationData);
    return await this.organizationRepository.save(organization);
  }

  async findById(id: string): Promise<Organization | null> {
    return await this.organizationRepository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Organization | null> {
    return await this.organizationRepository.findOne({ where: { name } });
  }

  async findAll(): Promise<Organization[]> {
    return await this.organizationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateData: Partial<Organization>): Promise<Organization> {
    await this.organizationRepository.update(id, updateData);
    const updatedOrganization = await this.findById(id);
    if (!updatedOrganization) {
      throw new Error('Organization not found after update');
    }
    return updatedOrganization;
  }

  async delete(id: string): Promise<void> {
    await this.organizationRepository.delete(id);
  }
}
