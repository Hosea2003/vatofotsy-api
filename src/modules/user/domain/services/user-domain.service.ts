import { User } from '../entities/user.entity';
import { UserRepositoryPort, UserValidationPort, PasswordHashingPort } from '../ports/user.ports';

export class UserDomainService {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly userValidation: UserValidationPort,
    private readonly passwordHashing: PasswordHashingPort,
  ) {}

  async createUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<User> {
    // Validate email format
    if (!this.userValidation.validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (!this.userValidation.validatePassword(password)) {
      throw new Error('Password does not meet requirements');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.passwordHashing.hash(password);

    // Create user
    const userId = this.generateUserId();
    const user = User.create(userId, email, hashedPassword, firstName, lastName);

    return await this.userRepository.create(user);
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

    const updatedUser = user.updateProfile(firstName, lastName);
    return await this.userRepository.update(updatedUser);
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

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
