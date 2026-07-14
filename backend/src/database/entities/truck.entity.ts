import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { TruckStock } from './truck-stock.entity';

@Entity('trucks')
export class Truck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  plateNumber: string;

  @Column({ nullable: true })
  pinCode: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  year: number;

  @Column({ type: 'int', default: 0 })
  currentStock: number;

  @Column({ type: 'int', default: 10 })
  stockAlertThreshold: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  mileage: number;

  @Column({ type: 'timestamp', nullable: true })
  insuranceExpirationDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  controlTechniqueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastServiceDate: Date;

  @Column({ nullable: true })
  registrationCardUrl: string;

  @Column({ nullable: true })
  insuranceCardUrl: string;

  @OneToMany(() => TruckStock, ts => ts.truck)
  stocks: TruckStock[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
