import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmployeesModule } from './employees/employees.module';
import { TrucksModule } from './trucks/trucks.module';
import { ClientsModule } from './clients/clients.module';
import { WorksitesModule } from './worksites/worksites.module';
import { MissionsModule } from './missions/missions.module';
import { TimeclockModule } from './timeclock/timeclock.module';
import { GpsModule } from './gps/gps.module';
import { PhotosModule } from './photos/photos.module';
import { StockModule } from './stock/stock.module';
import { ReportsModule } from './reports/reports.module';
import { StatsModule } from './stats/stats.module';
import { PlanningModule } from './planning/planning.module';
import { SeederService } from './database/seeder.service';
import { AuditModule } from './audit/audit.module';
import { AuditInterceptor } from './audit/audit.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: true,
        logging: config.get('NODE_ENV') === 'development',
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    EmployeesModule,
    TrucksModule,
    ClientsModule,
    WorksitesModule,
    MissionsModule,
    TimeclockModule,
    GpsModule,
    PhotosModule,
    StockModule,
    ReportsModule,
    StatsModule,
    PlanningModule,
    AuditModule,
  ],
  providers: [
    SeederService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
