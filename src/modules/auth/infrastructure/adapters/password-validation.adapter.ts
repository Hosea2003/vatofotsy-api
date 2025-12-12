import { Injectable, Inject } from '@nestjs/common';
import { PasswordValidationPort } from '../../domain/ports/auth.ports';
import type { PasswordHashingPort } from '../../../user/domain/ports/user.ports';
import { PASSWORD_HASHING } from '../../../user/user.tokens';

@Injectable()
export class PasswordValidationAdapter implements PasswordValidationPort {
  constructor(
    @Inject(PASSWORD_HASHING)
    private readonly passwordHashing: PasswordHashingPort,
  ) {}

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await this.passwordHashing.compare(plainPassword, hashedPassword);
  }
}
