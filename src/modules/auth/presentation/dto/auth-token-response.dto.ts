import { ApiProperty } from '@nestjs/swagger';

export class AuthTokenResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token (expires in 15 minutes)',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token (expires in 7 days)',
  })
  refreshToken: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID',
  })
  userId: string;

  @ApiProperty({
    example: '2023-01-01T00:15:00Z',
    description: 'Access token expiration time',
  })
  expiresAt: Date;

  constructor(partial: Partial<AuthTokenResponseDto>) {
    Object.assign(this, partial);
  }
}
