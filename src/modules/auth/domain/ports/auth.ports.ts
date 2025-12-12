import { AuthToken, AuthCredentials } from '../entities/auth.entity';
import { User } from '../../../user/domain/entities/user.entity';

export interface JwtTokenPort {
  sign(payload: any, options?: { expiresIn?: string }): Promise<string>;
  verify(token: string): Promise<any>;
  decode(token: string): any;
}

export interface AuthRepositoryPort {
  storeRefreshToken(userId: string, refreshToken: string): Promise<void>;
  getRefreshToken(userId: string): Promise<string | null>;
  revokeRefreshToken(userId: string): Promise<void>;
  isRefreshTokenValid(userId: string, refreshToken: string): Promise<boolean>;
}

export interface PasswordValidationPort {
  validatePassword(password: string, hashedPassword: string): Promise<boolean>;
}

export interface UserLookupPort {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
}

export interface AuthEventPort {
  publishLoginEvent(userId: string, timestamp: Date): Promise<void>;
  publishLogoutEvent(userId: string, timestamp: Date): Promise<void>;
  publishPasswordChangeEvent(userId: string, timestamp: Date): Promise<void>;
}
