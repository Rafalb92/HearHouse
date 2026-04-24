import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly auth: AuthService) {
    // Domyślnie passport-local oczekuje username/password,
    // ustawiamy usernameField na email:
    super({ usernameField: 'email', passwordField: 'password' });
  }

  async validate(email: string, password: string) {
    console.log('LOCAL validate()', { email, passwordType: typeof password });
    const user = await this.auth.validateLocalUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user; // będzie w req.user
  }
}
