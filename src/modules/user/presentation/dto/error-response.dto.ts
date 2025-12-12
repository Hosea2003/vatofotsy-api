import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    example: 400,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Error message',
  })
  message: string | string[];

  @ApiProperty({
    example: 'Bad Request',
    description: 'Error type',
  })
  error: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Timestamp when the error occurred',
  })
  timestamp: string;

  @ApiProperty({
    example: '/api/users',
    description: 'Request path where the error occurred',
  })
  path: string;
}
