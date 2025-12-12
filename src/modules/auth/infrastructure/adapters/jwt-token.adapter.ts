import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenPort } from '../../domain/ports/auth.ports';

@Injectable()
export class JwtTokenAdapter implements JwtTokenPort {
  constructor(private readonly jwtService: JwtService) {}

  async sign(payload: any, options?: { expiresIn?: string }): Promise<string> {
    return this.jwtService.signAsync(payload, options as any);
  }

  async verify(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token);
  }

  decode(token: string): any {
    return this.jwtService.decode(token);
  }
}
