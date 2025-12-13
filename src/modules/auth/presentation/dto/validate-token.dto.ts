import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT token to validate',
  })
  @IsString()
  @IsNotEmpty({ message: 'Token is required' })
  token: string;
}

export class TokenValidationResponseDto {
  @ApiProperty({
    example: true,
    description: 'Whether the token is valid',
  })
  valid: boolean;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID extracted from the token',
  })
  userId: string;

  @ApiProperty({
    example: '2023-01-01T00:15:00Z',
    description: 'Token expiration time',
  })
  expiresAt: Date;

  constructor(partial: Partial<TokenValidationResponseDto>) {
    Object.assign(this, partial);
  }
}
