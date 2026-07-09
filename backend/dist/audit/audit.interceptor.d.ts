import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { AuditLog } from '../database/entities/audit-log.entity';
export declare class AuditInterceptor implements NestInterceptor {
    private readonly auditRepo;
    constructor(auditRepo: Repository<AuditLog>);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
