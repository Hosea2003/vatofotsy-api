import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './presentation/controllers/auth.controller';
import { AuthDomainService } from './domain/services/auth-domain.service';
import { LoginUseCase, RefreshTokenUseCase, LogoutUseCase, ValidateTokenUseCase } from './application/use-cases/auth.use-cases';
import { JwtTokenAdapter } from './infrastructure/adapters/jwt-token.adapter';
import { InMemoryAuthRepository } from './infrastructure/adapters/in-memory-auth.repository';
import { UserLookupAdapter } from './infrastructure/adapters/user-lookup.adapter';
import { PasswordValidationAdapter } from './infrastructure/adapters/password-validation.adapter';
import { AuthEventAdapter } from './infrastructure/adapters/auth-event.adapter';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersModule } from '../user/users.module';
import {
  JWT_TOKEN_PORT,
  AUTH_REPOSITORY_PORT,
  PASSWORD_VALIDATION_PORT,
  USER_LOOKUP_PORT,
  AUTH_EVENT_PORT,
} from './auth.tokens';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') || 'fallback-secret-key',
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
    UsersModule, // Import to access user repository
  ],
  controllers: [AuthController],
  providers: [
    // Domain Services
    AuthDomainService,
    
    // Use Cases
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    ValidateTokenUseCase,
    
    // Guards
    JwtAuthGuard,
    
    // Infrastructure Adapters
    {
      provide: JWT_TOKEN_PORT,
      useClass: JwtTokenAdapter,
    },
    {
      provide: AUTH_REPOSITORY_PORT,
      useClass: InMemoryAuthRepository,
    },
    {
      provide: PASSWORD_VALIDATION_PORT,
      useClass: PasswordValidationAdapter,
    },
    {
      provide: USER_LOOKUP_PORT,
      useClass: UserLookupAdapter,
    },
    {
      provide: AUTH_EVENT_PORT,
      useClass: AuthEventAdapter,
    },
  ],
  exports: [
    AuthDomainService,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    ValidateTokenUseCase,
    JwtAuthGuard,
    JWT_TOKEN_PORT,
  ],
})
export class AuthModule {}
