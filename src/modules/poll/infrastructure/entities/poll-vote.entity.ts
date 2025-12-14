import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Poll } from './poll.entity';
import { PollChoice } from './poll-choice.entity';
import { User } from '../../../user/infrastructure/entities/user.entity';

@Entity('poll_votes')
@Unique(['pollId', 'userId', 'choiceId']) // Prevent duplicate votes for same choice
export class PollVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  pollId: string;

  @Column('uuid')
  choiceId: string;

  @Column('uuid')
  userId: string;

  @CreateDateColumn()
  votedAt: Date;

  // Relations
  @ManyToOne(() => Poll, poll => poll.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pollId' })
  poll: Poll;

  @ManyToOne(() => PollChoice, choice => choice.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'choiceId' })
  choice: PollChoice;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
