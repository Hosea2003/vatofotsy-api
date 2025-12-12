export class AuthToken {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly userId: string,
    public readonly expiresAt: Date,
  ) {}

  static create(
    accessToken: string,
    refreshToken: string,
    userId: string,
    expiresAt: Date,
  ): AuthToken {
    return new AuthToken(accessToken, refreshToken, userId, expiresAt);
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}

export class AuthCredentials {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}

  static create(email: string, password: string): AuthCredentials {
    return new AuthCredentials(email, password);
  }
}
