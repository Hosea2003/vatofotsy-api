import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './infrastructure/entities/organization.entity';
import { OrganizationController } from './presentation/controllers/organization.controller';
import { OrganizationDomainService } from './domain/services/organization-domain.service';
import {
  CreateOrganizationUseCase,
  GetOrganizationByIdUseCase,
  GetAllOrganizationsUseCase,
  UpdateOrganizationUseCase,
  DeleteOrganizationUseCase,
} from './application/use-cases/organization.use-cases';
import { TypeOrmOrganizationRepository } from './infrastructure/adapters/typeorm-organization.repository';
import { OrganizationValidationAdapter } from './infrastructure/adapters/organization-validation.adapter';
import { ORGANIZATION_REPOSITORY, ORGANIZATION_VALIDATION } from './organization.tokens';

@Module({
  imports: [TypeOrmModule.forFeature([Organization])],
  controllers: [OrganizationController],
  providers: [
    // Domain Services
    OrganizationDomainService,
    
    // Use Cases
    CreateOrganizationUseCase,
    GetOrganizationByIdUseCase,
    GetAllOrganizationsUseCase,
    UpdateOrganizationUseCase,
    DeleteOrganizationUseCase,
    
    // Repository
    {
      provide: ORGANIZATION_REPOSITORY,
      useClass: TypeOrmOrganizationRepository,
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
  ],
})
export class OrganizationModule {}
