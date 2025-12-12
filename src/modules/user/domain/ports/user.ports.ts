import { User } from '../entities/user.entity';

export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(): Promise<User[]>;
}

export interface UserValidationPort {
  validateEmail(email: string): boolean;
  validatePassword(password: string): boolean;
}

export interface PasswordHashingPort {
  hash(password: string): Promise<string>;
  compare(password: string, hashedPassword: string): Promise<boolean>;
}
