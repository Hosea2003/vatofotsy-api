import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Poll } from './poll.entity';
import { PollVote } from './poll-vote.entity';

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
}

@Entity('poll_choices')
export class PollChoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  pollId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  mediaUrl: string;

  @Column({
    type: 'enum',
    enum: MediaType,
    nullable: true,
  })
  mediaType: MediaType;

  @Column({ nullable: true })
  mediaFileName: string;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Poll, poll => poll.choices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pollId' })
  poll: Poll;

  @OneToMany(() => PollVote, vote => vote.choice)
  votes: PollVote[];

  // Virtual field for vote count
  voteCount?: number;
}
