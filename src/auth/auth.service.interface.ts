import { User } from "@prisma/client"
import { UserCreateDto } from "../user/dto/user-create.dto"
import { UserLoginDto } from "./dto/user-login.dto"

export interface IAuthService {
  createUser: (user: UserCreateDto) => Promise<User>
  loginUser: (user: UserLoginDto) => Promise<User>
  confirmUser: (confirmationCode: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  jwtAccessToken(user: User): { token: string; cookie: string }
  jwtRefreshToken(user: User): { token: string; cookie: string }
  restorePassword: (email: string, newPassword: string) => Promise<void>
  generatePassword: (password: string) => Promise<string>
}
