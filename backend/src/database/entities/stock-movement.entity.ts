import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Truck } from './truck.entity';
import { Mission } from './mission.entity';
import { Employee } from './employee.entity';

export enum StockMovementType {
  LOAD = 'load',
  CONSUME = 'consume',
  RETURN = 'return',
  ADJUSTMENT = 'adjustment',
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Truck)
  @JoinColumn()
  truck: Truck;

  @ManyToOne(() => Mission, { nullable: true })
  @JoinColumn()
  mission: Mission;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn()
  employee: Employee;

  @Column({ type: 'enum', enum: StockMovementType })
  type: StockMovementType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  stockBefore: number;

  @Column({ type: 'int' })
  stockAfter: number;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
