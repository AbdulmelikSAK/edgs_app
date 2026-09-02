"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employee = void 0;
const typeorm_1 = require("typeorm");
const role_entity_1 = require("./role.entity");
const employee_document_entity_1 = require("./employee-document.entity");
let Employee = class Employee {
    id;
    firstName;
    lastName;
    username;
    passwordHash;
    mustChangePassword;
    badgeNumber;
    isActive;
    twoFactorSecret;
    isTwoFactorEnabled;
    hourlyRate;
    paidLeaveBalance;
    paidLeaveN;
    paidLeaveN1;
    rttBalance;
    monthlySalary;
    hireDate;
    exitDate;
    birthDate;
    birthPlace;
    ssNumber;
    address;
    postalCode;
    city;
    contractType;
    contractStartDate;
    contractEndDate;
    amendmentsJson;
    emergencyContactName;
    emergencyContactPhone;
    baseMonthlyHours;
    functionTitle;
    medicalVisitDate;
    photoUrl;
    phone;
    email;
    qualification;
    employeeDocuments;
    role;
    createdAt;
    updatedAt;
};
exports.Employee = Employee;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Employee.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Employee.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Employee.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Employee.prototype, "mustChangePassword", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', unique: true, nullable: true }),
    __metadata("design:type", Object)
], Employee.prototype, "badgeNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Employee.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, select: false }),
    __metadata("design:type", String)
], Employee.prototype, "twoFactorSecret", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Employee.prototype, "isTwoFactorEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 35.00 }),
    __metadata("design:type", Number)
], Employee.prototype, "hourlyRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0.00 }),
    __metadata("design:type", Number)
], Employee.prototype, "paidLeaveBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 30.00 }),
    __metadata("design:type", Number)
], Employee.prototype, "paidLeaveN", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0.00 }),
    __metadata("design:type", Number)
], Employee.prototype, "paidLeaveN1", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0.00, nullable: true }),
    __metadata("design:type", Number)
], Employee.prototype, "rttBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Employee.prototype, "monthlySalary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "hireDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "exitDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "birthDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "birthPlace", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "ssNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "postalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 'CDI' }),
    __metadata("design:type", String)
], Employee.prototype, "contractType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "contractStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "contractEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "amendmentsJson", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "emergencyContactName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "emergencyContactPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 151.67 }),
    __metadata("design:type", Number)
], Employee.prototype, "baseMonthlyHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "functionTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "medicalVisitDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "photoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Employee.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Employee.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "qualification", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => employee_document_entity_1.EmployeeDocument, (doc) => doc.employee, { cascade: true }),
    __metadata("design:type", Array)
], Employee.prototype, "employeeDocuments", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => role_entity_1.Role, { nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", role_entity_1.Role)
], Employee.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Employee.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Employee.prototype, "updatedAt", void 0);
exports.Employee = Employee = __decorate([
    (0, typeorm_1.Entity)('employees')
], Employee);
//# sourceMappingURL=employee.entity.js.map