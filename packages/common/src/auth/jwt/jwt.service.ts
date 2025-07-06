import { Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private readonly secret = process.env.JWT_SECRET || 'secret';
  private readonly expiresIn = '1h';

  sign(payload: object): string {
    return sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verify<T = any>(token: string): T {
    return verify(token, this.secret) as T;
  }
}