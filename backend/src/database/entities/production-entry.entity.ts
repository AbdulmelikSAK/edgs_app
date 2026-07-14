import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Mission } from './mission.entity';
import { Employee } from './employee.entity';

@Entity('production_entries')
export class ProductionEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Mission, { onDelete: 'CASCADE' })
  @JoinColumn()
  mission: Mission;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  employee: Employee;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column()
  prestationType: string; // sablage, bouchardage, ponçage, custom

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ default: 'm²' })
  unit: string; // m², ml, u, forfait

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
