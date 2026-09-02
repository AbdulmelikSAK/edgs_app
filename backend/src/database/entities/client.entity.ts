import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ClientContact } from './client-contact.entity';
import { SiteSupervisor } from './site-supervisor.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  contactName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  countryCode: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => ClientContact, (contact) => contact.client, { cascade: true })
  contacts: ClientContact[];

  @OneToMany(() => SiteSupervisor, (supervisor) => supervisor.client)
  siteSupervisors: SiteSupervisor[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
