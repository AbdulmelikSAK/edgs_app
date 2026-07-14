import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Truck } from './truck.entity';

@Entity('equipments')
export class Equipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  serialNumber: string;

  @Column({ type: 'timestamp', nullable: true })
  purchaseDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastMaintenanceDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextMaintenanceDate: Date;

  @Column({ default: 'Disponible' })
  status: string; // Disponible, En panne, En maintenance

  @ManyToOne(() => Truck, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  assignedTruck: Truck;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
