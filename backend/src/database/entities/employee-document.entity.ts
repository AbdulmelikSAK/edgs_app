import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('employee_documents')
export class EmployeeDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  documentType: string; // E.g. "DIPLOMES", "PIECE_IDENTITE", "PERMIS", "PERMIS_BE", "RIB", "CARTE_VITALE", "ATTESTATION_VITALE", "CONTRAT", "DPAE", "AVENANT", "CARTE_BTP", "MEDECINE_TRAVAIL", "REGLEMENT", or custom type e.g. "Remise EPI"

  @Column()
  fileName: string;

  @Column()
  fileUrl: string;

  @ManyToOne(() => Employee, (emp) => emp.employeeDocuments, { onDelete: 'CASCADE' })
  employee: Employee;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
