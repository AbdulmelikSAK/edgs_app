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
exports.EmployeeDocument = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("./employee.entity");
let EmployeeDocument = class EmployeeDocument {
    id;
    documentType;
    fileName;
    fileUrl;
    employee;
    createdAt;
    updatedAt;
};
exports.EmployeeDocument = EmployeeDocument;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "documentType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "fileUrl", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, (emp) => emp.employeeDocuments, { onDelete: 'CASCADE' }),
    __metadata("design:type", employee_entity_1.Employee)
], EmployeeDocument.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EmployeeDocument.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], EmployeeDocument.prototype, "updatedAt", void 0);
exports.EmployeeDocument = EmployeeDocument = __decorate([
    (0, typeorm_1.Entity)('employee_documents')
], EmployeeDocument);
//# sourceMappingURL=employee-document.entity.js.map