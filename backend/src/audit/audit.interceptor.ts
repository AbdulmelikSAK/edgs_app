import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../database/entities/audit-log.entity';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip } = request;

    // Only audit write operations (POST, PUT, PATCH, DELETE)
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle().pipe(
        tap(async (response) => {
          try {
            const auditEntry = this.auditRepo.create({
              user: user && user.type === 'user' ? { id: user.sub } as any : null,
              action: `${method} ${url}`,
              entityType: url.split('/')[1] || 'Unknown',
              entityId: response?.id || body?.id || null,
              newValues: body ? { ...body } : null,
              ipAddress: ip || request.headers['x-forwarded-for'] || request.socket.remoteAddress,
            });
            await this.auditRepo.save(auditEntry);
          } catch (e) {
            console.error('Failed to save audit log:', e);
          }
        }),
      );
    }

    return next.handle();
  }
}
