import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Mission } from './mission.entity';
import { Employee } from './employee.entity';

@Entity('weekly_planning')
export class WeeklyPlanning {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  week: number;

  @Column({ type: 'int' })
  dayOfWeek: number;

  @ManyToOne(() => Mission)
  @JoinColumn()
  mission: Mission;

  @ManyToMany(() => Employee)
  @JoinTable({ name: 'planning_employees' })
  employees: Employee[];

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
