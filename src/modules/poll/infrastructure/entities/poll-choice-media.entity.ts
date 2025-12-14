import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PollChoice } from './poll-choice.entity';

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
}

@Entity('poll_choice_media')
export class PollChoiceMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  pollChoiceId: string;

  @Column()
  fileName: string;

  @Column()
  originalName: string;

  @Column()
  url: string;

  @Column({
    type: 'enum',
    enum: MediaType,
  })
  mediaType: MediaType;

  @Column()
  mimeType: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => PollChoice, pollChoice => pollChoice.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pollChoiceId' })
  pollChoice: PollChoice;
}
