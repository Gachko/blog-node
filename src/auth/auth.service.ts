import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UserCreateDto } from '../user/dto/userCreate.dto';
import * as argon from 'argon2'
import UserDTO from '../user/dto/user.dto';
//TODO
// @ts-ignore
import { PrismaClientKnownRequestError, User } from '@prisma/client';
import { UserLoginDto } from './dto/userLogin.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadType } from './types/jwtPayload.type';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(user: UserCreateDto) {
    const hash = await argon.hash(user.password)

    try {
      const newUser = await this.prisma.user.create({
        data: {
          ...user,
          password: hash
        }
      })
      return new UserDTO(newUser)
    } catch (e) {
      if(e instanceof PrismaClientKnownRequestError) {
        if(e.code === 'P2002') {
          throw new ForbiddenException('Credentials taken')
        }
      }
      throw e
    }


  }

  async login(user: UserLoginDto) {
    try{
      const existedUser = await this.prisma.user.findFirst({ where: { email: user.email } })
      const comparePassword = await argon.verify(existedUser.password, user.password)
      if(!comparePassword) {
        throw new ForbiddenException('Credentials are incorrect')
      }
      //return new UserDTO(existedUser)
      return await this.createJwt(existedUser)
    } catch (e) {
      console.log(e)
      throw new ForbiddenException('Credentials are incorrect12')
    }

  }

  getProfile(token: any) {
    console.log(token)
  }


  private async createJwt(user: User) {
    const payload = new JwtPayloadType(user).getPayload()
      return {
        access_token: await this.jwtService.signAsync(payload)
      }
  }
}