import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Mission } from './mission.entity';
import { Truck } from './truck.entity';

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

  @ManyToOne(() => Truck, { nullable: true })
  @JoinColumn()
  truck: Truck;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
