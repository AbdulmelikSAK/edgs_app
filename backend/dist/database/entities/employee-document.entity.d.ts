import { Employee } from './employee.entity';
export declare class EmployeeDocument {
    id: string;
    documentType: string;
    fileName: string;
    fileUrl: string;
    employee: Employee;
    createdAt: Date;
    updatedAt: Date;
}
