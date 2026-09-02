import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Truck } from './truck.entity';
import { Mission } from './mission.entity';
import { Employee } from './employee.entity';

import { StockItem } from './stock-item.entity';

export enum StockMovementType {
  LOAD = 'load',
  CONSUME = 'consume',
  RETURN = 'return',
  ADJUSTMENT = 'adjustment',
  REPLENISH = 'replenish',
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StockItem, { nullable: true })
  @JoinColumn()
  stockItem: StockItem;

  @ManyToOne(() => Truck, { nullable: true })
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

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  stockBefore: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  stockAfter: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitPriceAtTime: number;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
