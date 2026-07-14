import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Client } from './client.entity';
import { Quote } from './quote.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  invoiceNumber: string;

  @ManyToOne(() => Quote, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  quote: Quote;

  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
  @JoinColumn()
  client: Client;

  @Column({ default: 'Brouillon' })
  status: string; // Brouillon, Envoyé, Payé, Retard

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ type: 'text', nullable: true })
  lines: string; // JSON array of invoice items

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
