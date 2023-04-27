import { User } from "@prisma/client"
import { UserCreateDto } from "./dto/user-create.dto"
import UserDTO from "./dto/user.dto"
import { UserUpdateDto } from "./dto/user-update.dto"

export interface IUserService {
  createUser: (user: UserCreateDto) => Promise<User>
  findUserByEmail: (email: string) => Promise<User>
  findUsers: () => Promise<UserDTO[]>
  findMe: (id: string) => Promise<UserDTO>
  editUser: (user: UserUpdateDto, id: string) => Promise<UserDTO>
}
