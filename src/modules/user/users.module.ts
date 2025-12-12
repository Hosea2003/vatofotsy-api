import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './infrastructure/entities/user.entity';
import { UserController } from './presentation/controllers/user.controller';
import { UserRepository } from './infrastructure/adapters/user.repository';
import { UserValidationAdapter } from './infrastructure/adapters/user-validation.adapter';
import { PasswordHashingAdapter } from './infrastructure/adapters/password-hashing.adapter';
import { UserDomainService } from './domain/services/user-domain.service';
import { CreateUserUseCase, GetUserByIdUseCase } from './application/use-cases/user.use-cases';

// DI Tokens
export const USER_REPOSITORY = 'USER_REPOSITORY';
export const USER_VALIDATION = 'USER_VALIDATION';
export const PASSWORD_HASHING = 'PASSWORD_HASHING';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    // Domain Services
    UserDomainService,
    
    // Use Cases
    CreateUserUseCase,
    GetUserByIdUseCase,
    
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
    USER_REPOSITORY,
  ],
})
export class UsersModule {}
