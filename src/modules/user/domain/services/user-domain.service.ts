import { Inject, Injectable } from '@nestjs/common';
import type { UserRepositoryPort, UserValidationPort, PasswordHashingPort } from '../ports/user.ports';
import { User } from '../../infrastructure/entities/user.entity';
import { USER_REPOSITORY, USER_VALIDATION, PASSWORD_HASHING } from '../../user.tokens';

@Injectable()
export class UserDomainService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(USER_VALIDATION)
    private readonly userValidation: UserValidationPort,
    @Inject(PASSWORD_HASHING)
    private readonly passwordHashing: PasswordHashingPort,
  ) {}

  async createUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.passwordHashing.hash(password);

    // Create user
    const userData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      isVerified: true, // Set to true by default for now
    };

    return await this.userRepository.create(userData);
  }

  async updateUserProfile(
    userId: string,
    firstName?: string,
    lastName?: string,
  ): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updateData: Partial<User> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    return await this.userRepository.update(userId, updateData);
  }

  async validateUserCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.passwordHashing.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async getUserById(userId: string): Promise<User | null> {
    return await this.userRepository.findById(userId);
  }

  async verifyUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.verify();
    return await this.userRepository.update(userId, { isVerified: true });
  }

  async unverifyUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.unverify();
    return await this.userRepository.update(userId, { isVerified: false });
  }
}
