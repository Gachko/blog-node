import { UserCreateDto } from "./dto/user-create.dto"
import { User, Status } from "@prisma/client"
import { UserUpdateDto } from "./dto/user-update.dto"

export interface IUserRepository {
  create: (user: UserCreateDto) => Promise<User>
  findByEmail: (email: string) => Promise<User | null>
  findByIdOrThrow: (id: string) => Promise<User>
  updateStatus: (id: string, status: Status) => Promise<User>
  updatePassword: (id: string, password: string) => Promise<User>
  getAll: () => Promise<User[]>
  update: (user: UserUpdateDto, id: string) => Promise<User>
}
