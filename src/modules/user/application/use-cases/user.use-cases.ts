import { User } from '../../infrastructure/entities/user.entity';
import { UserDomainService } from '../../domain/services/user-domain.service';

export class CreateUserUseCase {
  constructor(private readonly userDomainService: UserDomainService) {}

  async execute(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<User> {
    return await this.userDomainService.createUser(email, password, firstName, lastName);
  }
}

export class GetUserByIdUseCase {
  constructor(private readonly userDomainService: UserDomainService) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userDomainService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}

export class UpdateUserProfileUseCase {
  constructor(private readonly userDomainService: UserDomainService) {}

  async execute(
    userId: string,
    firstName?: string,
    lastName?: string,
  ): Promise<User> {
    return await this.userDomainService.updateUserProfile(userId, firstName, lastName);
  }
}
