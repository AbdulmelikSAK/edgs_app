import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Client } from './client.entity';

@Entity('client_contacts')
export class ClientContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  role: string; // e.g. "Directeur de chantier", "Comptable", etc.

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @ManyToOne(() => Client, (client) => client.contacts, { onDelete: 'CASCADE' })
  client: Client;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
