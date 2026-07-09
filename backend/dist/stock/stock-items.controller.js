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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockItemsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stock_item_entity_1 = require("../database/entities/stock-item.entity");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let StockItemsController = class StockItemsController {
    itemRepo;
    constructor(itemRepo) {
        this.itemRepo = itemRepo;
    }
    async findAll(res) {
        const items = await this.itemRepo.find({ order: { name: 'ASC' } });
        res.setHeader('Content-Range', `stock-items 0-${items.length}/${items.length}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
        return res.json(items);
    }
    findOne(id) {
        return this.itemRepo.findOneBy({ id });
    }
    create(body) {
        const item = this.itemRepo.create(body);
        return this.itemRepo.save(item);
    }
    async update(id, body) {
        await this.itemRepo.update(id, body);
        return this.itemRepo.findOneBy({ id });
    }
    async remove(id) {
        const item = await this.itemRepo.findOneBy({ id });
        await this.itemRepo.delete(id);
        return item;
    }
};
exports.StockItemsController = StockItemsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StockItemsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockItemsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StockItemsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StockItemsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockItemsController.prototype, "remove", null);
exports.StockItemsController = StockItemsController = __decorate([
    (0, swagger_1.ApiTags)('stock-items'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('stock-items'),
    __param(0, (0, typeorm_1.InjectRepository)(stock_item_entity_1.StockItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StockItemsController);
//# sourceMappingURL=stock-items.controller.js.map