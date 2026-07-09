import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GpsService } from './gps.service';
import { CreateGpsPointDto } from './dto/create-gps-point.dto';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/gps' })
export class GpsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gpsService: GpsService) {}

  @SubscribeMessage('track')
  async handleTrack(
    @MessageBody() dto: CreateGpsPointDto,
    @ConnectedSocket() client: Socket,
  ) {
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

  @SubscribeMessage('join_backoffice')
  handleJoinBackoffice(@ConnectedSocket() client: Socket) {
    client.join('backoffice');
    return { event: 'joined', room: 'backoffice' };
  }
}
