import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './infrastructure/entities/organization.entity';
import { OrganizationMember } from './infrastructure/entities/organization-member.entity';
import { OrganizationController } from './presentation/controllers/organization.controller';
import { OrganizationMemberController, UserOrganizationController } from './presentation/controllers/organization-member.controller';
import { OrganizationDomainService } from './domain/services/organization-domain.service';
import {
  CreateOrganizationUseCase,
  GetOrganizationByIdUseCase,
  GetAllOrganizationsUseCase,
  UpdateOrganizationUseCase,
  DeleteOrganizationUseCase,
  InviteUserToOrganizationUseCase,
  AcceptOrganizationInviteUseCase,
  DeclineOrganizationInviteUseCase,
  GetOrganizationMembersUseCase,
  GetUserOrganizationsUseCase,
  GetPendingInvitesUseCase,
  RemoveOrganizationMemberUseCase,
  UpdateMemberRoleUseCase,
} from './application/use-cases/organization.use-cases';
import { TypeOrmOrganizationRepository } from './infrastructure/adapters/typeorm-organization.repository';
import { TypeOrmOrganizationMemberRepository } from './infrastructure/adapters/typeorm-organization-member.repository';
import { OrganizationValidationAdapter } from './infrastructure/adapters/organization-validation.adapter';
import { ORGANIZATION_REPOSITORY, ORGANIZATION_VALIDATION, ORGANIZATION_MEMBER_REPOSITORY } from './organization.tokens';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, OrganizationMember])],
  controllers: [OrganizationController, OrganizationMemberController, UserOrganizationController],
  providers: [
    // Domain Services
    OrganizationDomainService,
    
    // Organization Use Cases
    CreateOrganizationUseCase,
    GetOrganizationByIdUseCase,
    GetAllOrganizationsUseCase,
    UpdateOrganizationUseCase,
    DeleteOrganizationUseCase,
    
    // Member Use Cases
    InviteUserToOrganizationUseCase,
    AcceptOrganizationInviteUseCase,
    DeclineOrganizationInviteUseCase,
    GetOrganizationMembersUseCase,
    GetUserOrganizationsUseCase,
    GetPendingInvitesUseCase,
    RemoveOrganizationMemberUseCase,
    UpdateMemberRoleUseCase,
    
    // Repositories
    {
      provide: ORGANIZATION_REPOSITORY,
      useClass: TypeOrmOrganizationRepository,
    },
    {
      provide: ORGANIZATION_MEMBER_REPOSITORY,
      useClass: TypeOrmOrganizationMemberRepository,
    },
    
    // Validation
    {
      provide: ORGANIZATION_VALIDATION,
      useClass: OrganizationValidationAdapter,
    },
  ],
  exports: [
    OrganizationDomainService,
    CreateOrganizationUseCase,
    GetOrganizationByIdUseCase,
    GetAllOrganizationsUseCase,
    UpdateOrganizationUseCase,
    DeleteOrganizationUseCase,
    InviteUserToOrganizationUseCase,
    AcceptOrganizationInviteUseCase,
    DeclineOrganizationInviteUseCase,
    GetOrganizationMembersUseCase,
    GetUserOrganizationsUseCase,
    GetPendingInvitesUseCase,
    RemoveOrganizationMemberUseCase,
    UpdateMemberRoleUseCase,
  ],
})
export class OrganizationModule {}
