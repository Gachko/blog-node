import "reflect-metadata"
import { IUserService } from "./user.service.interface"
import { inject, injectable } from "inversify"
import { TYPES } from "../common/constants/types"
import { IUserRepository } from "./user.repository.interface"
import { UserCreateDto } from "./dto/user-create.dto"
import { User } from "@prisma/client"
import { IConfigService } from "../common/config/config.service.interface"
import { HttpError } from "../common/errors/http-error"
import { StatusCodes } from "http-status-codes"
import UserDTO from "./dto/user.dto"
import { UserUpdateDto } from "./dto/user-update.dto"

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.IConfigService) private configService: IConfigService,
  ) {}

  async createUser(user: UserCreateDto): Promise<User> {
    const existedUser = await this.userRepository.findByEmail(user.email)
    if (existedUser) {
      throw new HttpError(StatusCodes.CONFLICT, "User already exists")
    }
    return await this.userRepository.create(user)
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email)
    if (!user) throw new HttpError(StatusCodes.NOT_FOUND, "User doesnt found")
    return user
  }

  async findUsers(): Promise<UserDTO[]> {
    const users = await this.userRepository.getAll()
    return users.map((user: User) => new UserDTO(user))
  }

  async findMe(id: string): Promise<UserDTO> {
    const user = await this.userRepository.findByIdOrThrow(id)
    if (user.id !== id) throw new HttpError(StatusCodes.FORBIDDEN, "Access denied")
    return new UserDTO(user)
  }

  async editUser(user: UserUpdateDto, id: string): Promise<UserDTO> {
    return await this.userRepository.update(user, id)
  }
}
