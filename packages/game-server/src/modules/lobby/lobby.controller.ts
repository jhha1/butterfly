import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { LobbyService } from './lobby.service';
import { LobbyRefreshRequestDto } from './dto/lobby-refresh-request.dto';
import { LobbyRefreshResponseDto } from './dto/lobby-refresh-response.dto';

@Controller()
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  @GrpcMethod('LobbyService', 'LobbyRefresh')
  async lobbyRefresh(request: LobbyRefreshRequestDto): Promise<LobbyRefreshResponseDto> {
    return this.lobbyService.lobbyRefresh(request);
  }
}