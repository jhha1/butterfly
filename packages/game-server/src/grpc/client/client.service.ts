import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateRoomRequest, CreateRoomResponse, GetRoomInfoRequest, GetRoomInfoResponse } from './types/game.types';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

interface GrpcClient {
    createRoom(request: CreateRoomRequest): Observable<CreateRoomResponse>;
    getRoomInfo(request: GetRoomInfoRequest): Observable<GetRoomInfoResponse>;
}

@Injectable()
export class ClientService implements OnModuleInit {
    private readonly logger: Logger;
    private grpcClient!: GrpcClient;

    constructor(
        @Inject('INGAME_GRPC_CLIENT') private readonly client: ClientGrpc,
    ) {
        this.logger = new Logger(ClientService.name);
    }

    public onModuleInit() {
        this.grpcClient = this.client.getService<GrpcClient>('IngameService');
    }

    public async createRoom(request: CreateRoomRequest): Promise<CreateRoomResponse> {
        try {
          console.log('Sending create room request:', request);
          console.log('Request fields:', {
            player1Id: request.player1Id,
            player2Id: request.player2Id,
            matchId: request.matchId,
            roomId: request.roomId,
            hasRoomId: !!request.roomId
          });
          
          const response$ = this.grpcClient.createRoom(request);
          const response = await firstValueFrom(response$);
          console.log('Room created via gRPC:', response);
          return response;
        } catch (error) {
          console.error('Error creating room:', error);
          throw error;
        }
    }

    public async getRoomInfo(request: GetRoomInfoRequest): Promise<GetRoomInfoResponse> {
        try {
          const response$ = this.grpcClient.getRoomInfo(request);
          const response = await firstValueFrom(response$);
          console.log('Room info via gRPC:', response);
          return response;
        } catch (error) {
          console.error('Error getting room info:', error);
          throw error;
        }
    }
}