import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { UserLoginDto } from '../dto/userLogin.dto';
import UserDTO from '../../user/dto/user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<UserDTO> {
    const user: UserLoginDto = {
      email,
      password,
    };
    return this.authService.login(user);
  }
}
