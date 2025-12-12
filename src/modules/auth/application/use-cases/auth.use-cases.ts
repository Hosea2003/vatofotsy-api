import { AuthToken, AuthCredentials } from '../../domain/entities/auth.entity';
import { AuthDomainService } from '../../domain/services/auth-domain.service';

export class LoginUseCase {
  constructor(private readonly authDomainService: AuthDomainService) {}

  async execute(email: string, password: string): Promise<AuthToken> {
    const credentials = AuthCredentials.create(email, password);
    return await this.authDomainService.login(credentials);
  }
}

export class RefreshTokenUseCase {
  constructor(private readonly authDomainService: AuthDomainService) {}

  async execute(refreshToken: string, userId: string): Promise<AuthToken> {
    return await this.authDomainService.refreshToken(refreshToken, userId);
  }
}

export class LogoutUseCase {
  constructor(private readonly authDomainService: AuthDomainService) {}

  async execute(userId: string): Promise<void> {
    return await this.authDomainService.logout(userId);
  }
}

export class ValidateTokenUseCase {
  constructor(private readonly authDomainService: AuthDomainService) {}

  async execute(token: string): Promise<any> {
    return await this.authDomainService.validateToken(token);
  }
}
