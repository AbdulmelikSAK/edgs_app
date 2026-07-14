import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Client } from './client.entity';
import { Mission } from './mission.entity';

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  quoteNumber: string;

  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
  @JoinColumn()
  client: Client;

  @ManyToOne(() => Mission, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  mission: Mission;

  @Column({ default: 'Brouillon' })
  status: string; // Brouillon, Envoyé, Accepté, Refusé, Facturé

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({ type: 'text', nullable: true })
  lines: string; // JSON array of quote items

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalHT: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 20 })
  vatRate: number; // percentage, e.g. 20

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
