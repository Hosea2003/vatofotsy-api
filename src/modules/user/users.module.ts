import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './infrastructure/entities/user.entity';
import { UserController } from './presentation/controllers/user.controller';
import { UserRepository } from './infrastructure/adapters/user.repository';
import { UserValidationAdapter } from './infrastructure/adapters/user-validation.adapter';
import { PasswordHashingAdapter } from './infrastructure/adapters/password-hashing.adapter';
import { UserDomainService } from './domain/services/user-domain.service';
import { CreateUserUseCase, GetUserByIdUseCase, UpdateUserProfileUseCase } from './application/use-cases/user.use-cases';
import { USER_REPOSITORY, USER_VALIDATION, PASSWORD_HASHING } from './user.tokens';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    // Domain Services
    UserDomainService,
    
    // Use Cases
    CreateUserUseCase,
    GetUserByIdUseCase,
    UpdateUserProfileUseCase,
    
    // Infrastructure Adapters
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: USER_VALIDATION,
      useClass: UserValidationAdapter,
    },
    {
      provide: PASSWORD_HASHING,
      useClass: PasswordHashingAdapter,
    },
  ],
  exports: [
    UserDomainService,
    CreateUserUseCase,
    GetUserByIdUseCase,
    UpdateUserProfileUseCase,
    USER_REPOSITORY,
    PASSWORD_HASHING,
  ],
})
export class UsersModule {}
