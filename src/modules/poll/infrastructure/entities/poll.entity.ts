import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../../user/infrastructure/entities/user.entity';
import { Organization } from '../../../organization/infrastructure/entities/organization.entity';
import { PollChoice } from './poll-choice.entity';
import { PollVote } from './poll-vote.entity';

export enum PollType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum ResultDisplayType {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum PollStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
}

@Entity('polls')
export class Poll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column('uuid')
  createdBy: string;

  @Column('uuid', { nullable: true })
  organizationId: string;

  @Column({
    type: 'enum',
    enum: PollType,
    default: PollType.PUBLIC,
  })
  type: PollType;

  @Column({
    type: 'enum',
    enum: ResultDisplayType,
    default: ResultDisplayType.CLOSED,
  })
  resultDisplayType: ResultDisplayType;

  @Column({
    type: 'enum',
    enum: PollStatus,
    default: PollStatus.DRAFT,
  })
  status: PollStatus;

  @Column({ type: 'timestamp' })
  votingEndsAt: Date;

  @Column({ default: false })
  allowMultipleChoices: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @OneToMany(() => PollChoice, choice => choice.poll, { cascade: true })
  choices: PollChoice[];

  @OneToMany(() => PollVote, vote => vote.poll)
  votes: PollVote[];

  // Helper methods
  get isVotingActive(): boolean {
    return this.status === PollStatus.ACTIVE && new Date() < this.votingEndsAt;
  }

  get isVotingEnded(): boolean {
    return this.status === PollStatus.ENDED || new Date() >= this.votingEndsAt;
  }

  get canViewResults(): boolean {
    return this.resultDisplayType === ResultDisplayType.OPEN || this.isVotingEnded;
  }
}
