import { Inject, Injectable } from '@nestjs/common';
import { AuthToken, AuthCredentials } from '../entities/auth.entity';
import { User } from '../../../user/infrastructure/entities/user.entity';
import type { 
  JwtTokenPort, 
  AuthRepositoryPort, 
  PasswordValidationPort, 
  UserLookupPort,
  AuthEventPort 
} from '../ports/auth.ports';
import { 
  JWT_TOKEN_PORT, 
  AUTH_REPOSITORY_PORT, 
  PASSWORD_VALIDATION_PORT, 
  USER_LOOKUP_PORT, 
  AUTH_EVENT_PORT 
} from '../../auth.tokens';

@Injectable()
export class AuthDomainService {
  constructor(
    @Inject(JWT_TOKEN_PORT)
    private readonly jwtToken: JwtTokenPort,
    @Inject(AUTH_REPOSITORY_PORT)
    private readonly authRepository: AuthRepositoryPort,
    @Inject(PASSWORD_VALIDATION_PORT)
    private readonly passwordValidation: PasswordValidationPort,
    @Inject(USER_LOOKUP_PORT)
    private readonly userLookup: UserLookupPort,
    @Inject(AUTH_EVENT_PORT)
    private readonly authEvent: AuthEventPort,
  ) {}

  async login(credentials: AuthCredentials): Promise<AuthToken> {
    const user = await this.userLookup.findUserByEmail(credentials.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await this.passwordValidation.validatePassword(
      credentials.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new Error('User account is not verified');
    }

    const tokens = await this.generateTokens(user.id);
    
    // Store refresh token
    await this.authRepository.storeRefreshToken(user.id, tokens.refreshToken);
    
    // Publish login event
    await this.authEvent.publishLoginEvent(user.id, new Date());

    return tokens;
  }

  async refreshToken(refreshToken: string, userId: string): Promise<AuthToken> {
    const isValidRefreshToken = await this.authRepository.isRefreshTokenValid(
      userId,
      refreshToken,
    );
    if (!isValidRefreshToken) {
      throw new Error('Invalid refresh token');
    }

    const user = await this.userLookup.findUserById(userId);
    if (!user || !user.isVerified) {
      throw new Error('User not found or not verified');
    }

    const tokens = await this.generateTokens(user.id);
    
    // Update refresh token
    await this.authRepository.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.authRepository.revokeRefreshToken(userId);
    await this.authEvent.publishLogoutEvent(userId, new Date());
  }

  async validateToken(token: string): Promise<any> {
    try {
      return await this.jwtToken.verify(token);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  private async generateTokens(userId: string): Promise<AuthToken> {
    const payload = { userId, sub: userId };
    
    const accessToken = await this.jwtToken.sign(payload, { expiresIn: '15m' });
    const refreshToken = await this.jwtToken.sign(payload, { expiresIn: '7d' });
    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes from now

    return AuthToken.create(accessToken, refreshToken, userId, expiresAt);
  }
}
