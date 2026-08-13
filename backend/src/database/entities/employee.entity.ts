import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ default: true })
  mustChangePassword: boolean;

  @Column({ type: 'varchar', unique: true, nullable: true })
  badgeNumber: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 35.0 })
  hourlyRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthlySalary: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.0 })
  paidLeaveBalance: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.0 })
  rttBalance: number;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ nullable: true })
  qualification: string;

  @Column({ nullable: true, type: 'text' })
  documents: string;

  @ManyToOne(() => Role, { nullable: true })
  @JoinColumn()
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
