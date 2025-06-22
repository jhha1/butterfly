import { Catch, ArgumentsHost, RpcExceptionFilter } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';
import { GameException } from '../exceptions/game.exception';

@Catch(GameException)
export class GameExceptionFilter implements RpcExceptionFilter {
  catch(exception: GameException, host: ArgumentsHost) {
    const ctx = host.switchToRpc();
    const callback = ctx.getContext<sendUnaryData<any>>();

    const errorPayload = exception.getError();
    callback(null, errorPayload);

    // Return empty observable to satisfy return type
    return of();
  }
}