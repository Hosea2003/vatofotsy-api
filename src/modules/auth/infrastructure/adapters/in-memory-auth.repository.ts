import { Injectable } from '@nestjs/common';
import { AuthRepositoryPort } from '../../domain/ports/auth.ports';

@Injectable()
export class InMemoryAuthRepository implements AuthRepositoryPort {
  private refreshTokens: Map<string, string> = new Map();

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    this.refreshTokens.set(userId, refreshToken);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    return this.refreshTokens.get(userId) || null;
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    this.refreshTokens.delete(userId);
  }

  async isRefreshTokenValid(userId: string, refreshToken: string): Promise<boolean> {
    const storedToken = this.refreshTokens.get(userId);
    return storedToken === refreshToken;
  }
}
