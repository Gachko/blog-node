import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UserUpdateDto } from './dto/userUpdate.dto';
import { User } from '@prisma/client';
import UserDTO from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserById(id: string) {
    try {
      const existedUser = await this.prisma.user.findFirst({ where: { id } });
      return existedUser;
    } catch (e) {
      throw new ForbiddenException('Credentials are incorrect');
    }
  }

  async getUserByEmail(email: string) {
    return await this.prisma.user.findFirst({ where: { email } });
  }

  async getUsers() {
    const users = await this.prisma.user.findMany();
    return users.map((user: User) => new UserDTO(user));
  }

  async update(user: UserUpdateDto, id: string) {
    return await this.prisma.user.update({
      where: { id },
      data: {
        status: user.status,
        role: user.role,
      },
    });
  }
}
