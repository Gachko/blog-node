import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UserCreateDto } from '../user/dto/userCreate.dto';
import * as argon from 'argon2';
import UserDTO from '../user/dto/user.dto';
import { User } from '@prisma/client';
import { UserLoginDto } from './dto/userLogin.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadType } from './types/jwtPayload.type';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async register(user: UserCreateDto) {
    const hash = await argon.hash(user.password);
    const isUserExist = await this.userService.getUserByEmail(user.email);
    if (isUserExist) {
      throw new ForbiddenException('Credentials taken');
    }
    try {
      const newUser = await this.prisma.user.create({
        data: {
          ...user,
          password: hash,
        },
      });
      return new UserDTO(newUser);
    } catch (e) {
      throw e;
    }
  }

  async login(user: UserLoginDto) {
    try {
      const existedUser = await this.userService.getUserByEmail(user.email);
      const comparePassword = await argon.verify(
        existedUser.password,
        user.password,
      );
      if (!comparePassword) {
        throw new ForbiddenException('Credentials are incorrect');
      }
      return new UserDTO(existedUser);
    } catch (e) {
      throw new ForbiddenException('Credentials are incorrect');
    }
  }

  getCookieWithJWTToken(user: User) {
    const payload = new JwtPayloadType(user).getPayload();
    const token = this.jwtService.sign(payload);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=3600s`;
  }

  public getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }
}
