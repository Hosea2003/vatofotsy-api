import { Injectable, Inject } from '@nestjs/common';
import { UserLookupPort } from '../../domain/ports/auth.ports';
import type { UserRepositoryPort } from '../../../user/domain/ports/user.ports';
import { USER_REPOSITORY } from '../../../user/user.tokens';
import { User } from '../../../user/infrastructure/entities/user.entity';

@Injectable()
export class UserLookupAdapter implements UserLookupPort {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async findUserById(userId: string): Promise<User | null> {
    return await this.userRepository.findById(userId);
  }
}
