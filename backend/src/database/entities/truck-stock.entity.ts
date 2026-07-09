import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Truck } from './truck.entity';
import { StockItem } from './stock-item.entity';

@Entity('truck_stocks')
export class TruckStock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Truck, { onDelete: 'CASCADE' })
  @JoinColumn()
  truck: Truck;

  @ManyToOne(() => StockItem, { onDelete: 'CASCADE', eager: true })
  @JoinColumn()
  stockItem: StockItem;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
