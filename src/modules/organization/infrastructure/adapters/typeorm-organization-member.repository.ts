import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationMember, InviteStatus } from '../entities/organization-member.entity';
import type { OrganizationMemberRepositoryPort } from '../../domain/ports/organization.ports';

@Injectable()
export class TypeOrmOrganizationMemberRepository implements OrganizationMemberRepositoryPort {
  constructor(
    @InjectRepository(OrganizationMember)
    private readonly memberRepository: Repository<OrganizationMember>,
  ) {}

  async create(memberData: Partial<OrganizationMember>): Promise<OrganizationMember> {
    const member = this.memberRepository.create(memberData);
    return await this.memberRepository.save(member);
  }

  async findById(id: string): Promise<OrganizationMember | null> {
    return await this.memberRepository.findOne({
      where: { id },
      relations: ['organization', 'user'],
    });
  }

  async findByOrganizationAndUser(organizationId: string, userId: string): Promise<OrganizationMember | null> {
    return await this.memberRepository.findOne({
      where: { organizationId, userId },
      relations: ['organization', 'user'],
    });
  }

  async findByOrganizationId(organizationId: string): Promise<OrganizationMember[]> {
    return await this.memberRepository.find({
      where: { organizationId },
      relations: ['organization', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: string): Promise<OrganizationMember[]> {
    return await this.memberRepository.find({
      where: { userId, status: InviteStatus.ACCEPTED },
      relations: ['organization', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingInvites(userId: string): Promise<OrganizationMember[]> {
    return await this.memberRepository.find({
      where: { userId, status: InviteStatus.PENDING },
      relations: ['organization', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateData: Partial<OrganizationMember>): Promise<OrganizationMember> {
    await this.memberRepository.update(id, updateData);
    const updatedMember = await this.findById(id);
    if (!updatedMember) {
      throw new Error('Organization member not found after update');
    }
    return updatedMember;
  }

  async delete(id: string): Promise<void> {
    await this.memberRepository.delete(id);
  }
}
