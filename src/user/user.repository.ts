import "reflect-metadata"
import { inject, injectable } from "inversify"
import { UserCreateDto } from "./dto/user-create.dto"
import { User, Status } from "@prisma/client"
import { IUserRepository } from "./user.repository.interface"
import { DatabaseService } from "../common/database/database.service"
import { TYPES } from "../common/constants/types"
import { UserUpdateDto } from "./dto/user-update.dto"

@injectable()
export class UserRepository implements IUserRepository {
  constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {}

  async create(user: UserCreateDto): Promise<User> {
    return await this.databaseService.client.user.create({ data: user })
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.databaseService.client.user.findFirst({ where: { email } })
  }

  async findByIdOrThrow(id: string): Promise<User> {
    return await this.databaseService.client.user.findUniqueOrThrow({ where: { id } })
  }

  async updateStatus(id: string, status: Status): Promise<User> {
    return await this.databaseService.client.user.update({ where: { id }, data: { status } })
  }

  async updatePassword(id: string, password: string): Promise<User> {
    return await this.databaseService.client.user.update({ where: { id }, data: { password } })
  }

  async getAll(): Promise<User[]> {
    return await this.databaseService.client.user.findMany()
  }

  async update(user: UserUpdateDto, id: string): Promise<User> {
    return await this.databaseService.client.user.update({
      where: { id },
      data: {
        status: user.status,
        role: user.role,
      },
    })
  }
}
