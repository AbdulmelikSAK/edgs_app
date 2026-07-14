"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const employees_module_1 = require("./employees/employees.module");
const trucks_module_1 = require("./trucks/trucks.module");
const clients_module_1 = require("./clients/clients.module");
const worksites_module_1 = require("./worksites/worksites.module");
const missions_module_1 = require("./missions/missions.module");
const timeclock_module_1 = require("./timeclock/timeclock.module");
const gps_module_1 = require("./gps/gps.module");
const photos_module_1 = require("./photos/photos.module");
const stock_module_1 = require("./stock/stock.module");
const reports_module_1 = require("./reports/reports.module");
const stats_module_1 = require("./stats/stats.module");
const planning_module_1 = require("./planning/planning.module");
const seeder_service_1 = require("./database/seeder.service");
const audit_module_1 = require("./audit/audit.module");
const audit_interceptor_1 = require("./audit/audit.interceptor");
const core_1 = require("@nestjs/core");
const production_module_1 = require("./production/production.module");
const equipment_module_1 = require("./equipment/equipment.module");
const billing_module_1 = require("./billing/billing.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    type: 'postgres',
                    url: config.get('DATABASE_URL'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
                    synchronize: true,
                    logging: config.get('NODE_ENV') === 'development',
                    autoLoadEntities: true,
                }),
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            employees_module_1.EmployeesModule,
            trucks_module_1.TrucksModule,
            clients_module_1.ClientsModule,
            worksites_module_1.WorksitesModule,
            missions_module_1.MissionsModule,
            timeclock_module_1.TimeclockModule,
            gps_module_1.GpsModule,
            photos_module_1.PhotosModule,
            stock_module_1.StockModule,
            reports_module_1.ReportsModule,
            stats_module_1.StatsModule,
            planning_module_1.PlanningModule,
            audit_module_1.AuditModule,
            production_module_1.ProductionModule,
            equipment_module_1.EquipmentModule,
            billing_module_1.BillingModule,
        ],
        providers: [
            seeder_service_1.SeederService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_interceptor_1.AuditInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map