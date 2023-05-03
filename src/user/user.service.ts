import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

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
}
