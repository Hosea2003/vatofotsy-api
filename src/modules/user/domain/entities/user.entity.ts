export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(
    id: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): User {
    return new User(id, email, password, firstName, lastName);
  }

  updateProfile(firstName?: string, lastName?: string): User {
    return new User(
      this.id,
      this.email,
      this.password,
      firstName ?? this.firstName,
      lastName ?? this.lastName,
      this.isActive,
      this.createdAt,
      new Date(),
    );
  }

  deactivate(): User {
    return new User(
      this.id,
      this.email,
      this.password,
      this.firstName,
      this.lastName,
      false,
      this.createdAt,
      new Date(),
    );
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
