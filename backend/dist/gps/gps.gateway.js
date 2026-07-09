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
exports.GpsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const gps_service_1 = require("./gps.service");
const create_gps_point_dto_1 = require("./dto/create-gps-point.dto");
let GpsGateway = class GpsGateway {
    gpsService;
    server;
    constructor(gpsService) {
        this.gpsService = gpsService;
    }
    async handleTrack(dto, client) {
        const point = await this.gpsService.track(dto);
        this.server.to('backoffice').emit('position_update', {
            truckId: dto.truckId,
            latitude: dto.latitude,
            longitude: dto.longitude,
            speed: dto.speed,
            timestamp: point.createdAt,
        });
        return point;
    }
    handleJoinBackoffice(client) {
        client.join('backoffice');
        return { event: 'joined', room: 'backoffice' };
    }
};
exports.GpsGateway = GpsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GpsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('track'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_gps_point_dto_1.CreateGpsPointDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], GpsGateway.prototype, "handleTrack", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_backoffice'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GpsGateway.prototype, "handleJoinBackoffice", null);
exports.GpsGateway = GpsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' }, namespace: '/gps' }),
    __metadata("design:paramtypes", [gps_service_1.GpsService])
], GpsGateway);
//# sourceMappingURL=gps.gateway.js.map