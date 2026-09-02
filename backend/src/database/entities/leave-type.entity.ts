import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('leave_types')
export class LeaveTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g. "Absence non justifiée", "Accident du travail", "Arrêt maladie", "Congés payés", "Congés sans solde"

  @Column({ nullable: true })
  code: string;

  @Column({ default: true })
  isPaid: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
