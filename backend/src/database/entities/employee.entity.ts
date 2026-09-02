import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToMany } from 'typeorm';
import { Role } from './role.entity';
import { EmployeeDocument } from './employee-document.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ default: true })
  mustChangePassword: boolean;

  @Column({ type: 'varchar', unique: true, nullable: true })
  badgeNumber: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 35.00 })
  hourlyRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  paidLeaveBalance: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 30.00 })
  paidLeaveN: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  paidLeaveN1: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00, nullable: true })
  rttBalance?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthlySalary?: number;

  @Column({ type: 'date', nullable: true })
  hireDate: string;

  @Column({ type: 'date', nullable: true })
  exitDate: string;

  @Column({ type: 'date', nullable: true })
  birthDate: string;

  @Column({ nullable: true })
  birthPlace: string;

  @Column({ nullable: true })
  ssNumber: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true, default: 'CDI' })
  contractType: string; // CDI, CDD, Autre

  @Column({ type: 'date', nullable: true })
  contractStartDate: string;

  @Column({ type: 'date', nullable: true })
  contractEndDate: string;

  @Column({ type: 'text', nullable: true })
  amendmentsJson: string; // JSON array of amendments

  @Column({ nullable: true })
  emergencyContactName: string;

  @Column({ nullable: true })
  emergencyContactPhone: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 151.67 })
  baseMonthlyHours: number;

  @Column({ nullable: true })
  functionTitle: string; // Bouchardeur, Ponceur, Hydrodécapeur, Sableur, Second

  @Column({ type: 'date', nullable: true })
  medicalVisitDate: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ nullable: true })
  qualification: string;

  @OneToMany(() => EmployeeDocument, (doc) => doc.employee, { cascade: true })
  employeeDocuments: EmployeeDocument[];

  @ManyToOne(() => Role, { nullable: true })
  @JoinColumn()
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
