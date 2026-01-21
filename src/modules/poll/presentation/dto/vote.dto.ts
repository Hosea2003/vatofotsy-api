import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VotePollDto {
  @ApiProperty({
    description: 'The ID of the poll choice to vote for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  choiceId: string;
}

export class VotePollResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Vote recorded successfully',
  })
  message: string;

  @ApiProperty({
    description: 'The ID of the poll',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  pollId: string;

  @ApiProperty({
    description: 'The ID of the choice voted for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  choiceId: string;
}
