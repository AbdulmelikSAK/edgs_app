import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  fileUrl: string; // PDF URL

  @Column({ default: 'ALL' })
  targetType: string; // ALL or SPECIFIC

  @Column({ type: 'text', nullable: true })
  targetEmployeeIdsJson: string; // JSON array of employee UUIDs if SPECIFIC

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
