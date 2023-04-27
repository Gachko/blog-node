import "reflect-metadata"
import { inject, injectable } from "inversify"
import { IAuthService } from "./auth.service.interface"
import { UserCreateDto } from "../user/dto/user-create.dto"
import { Status, User } from "@prisma/client"
import { UserLoginDto } from "./dto/user-login.dto"
import { TYPES } from "../common/constants/types"
import { IConfigService } from "../common/config/config.service.interface"
import { IUserRepository } from "../user/user.repository.interface"
import { StatusCodes } from "http-status-codes"
import { HttpError } from "../common/errors/http-error"
import { IUserService } from "../user/user.service.interface"
import jwt, { JwtPayload } from "jsonwebtoken"
import { IMailerService } from "../mailer/mailer.service.interface"
import { ITokenPayload } from "../common/interface/tokenPayload.interface"
import bcrypt from "bcryptjs"

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.IConfigService) private configService: IConfigService,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.IUserService) private userService: IUserService,
    @inject(TYPES.IMailerService) private mailerService: IMailerService,
  ) {}

  private makeTokenPayload(user: User): ITokenPayload {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    }
  }

  async createUser(user: UserCreateDto): Promise<User> {
    const hashedPassword = await this.generatePassword(user.password)
    return await this.userService.createUser({ ...user, password: hashedPassword })
  }

  async loginUser(user: UserLoginDto): Promise<User> {
    const existedUser = await this.userRepository.findByEmail(user.email)
    if (!existedUser || existedUser.status === Status.INACTIVE) {
      throw new HttpError(StatusCodes.NOT_FOUND, "Invalid password or email")
    }
    await this.verifyPassword(user.password, existedUser.password)
    return existedUser
  }

  async confirmUser(confirmationCode: string): Promise<void> {
    const jwtParse: JwtPayload = jwt.verify(confirmationCode, this.configService.get("SECRET")) as JwtPayload
    const existedUser = await this.userRepository.findByIdOrThrow(jwtParse.id)
    await this.userRepository.updateStatus(existedUser.id, Status.ACTIVE)
  }

  async resetPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email)
    if (user) {
      const { token } = this.jwtAccessToken(user)
      await this.mailerService.resetPassword(user.email, token)
    } else throw new HttpError(StatusCodes.NOT_FOUND, "User doesnt found")
  }

  jwtAccessToken(user: User) {
    const payload = this.makeTokenPayload(user)
    const token = jwt.sign(payload, this.configService.get("JWT_ACCESS_TOKEN_SECRET"), {
      expiresIn: `${this.configService.get("JWT_ACCESS_TOKEN_EXPIRATION_TIME")}s`,
    })
    const cookie = `accessToken=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      "JWT_ACCESS_TOKEN_EXPIRATION_TIME",
    )}`

    return { token, cookie }
  }

  async restorePassword(email: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email)
    if (user) {
      const isPasswordsMatch = await bcrypt.compare(newPassword, user.password)
      if (isPasswordsMatch) throw new HttpError(StatusCodes.BAD_REQUEST, "The old and new password are the same")
      const hashedNewPassword = await this.generatePassword(newPassword)
      await this.userRepository.updatePassword(user.id, hashedNewPassword)
    } else throw new HttpError(StatusCodes.NOT_FOUND, "User doesnt exist")
  }

  jwtRefreshToken(user: User) {
    const payload = this.makeTokenPayload(user)
    const token = jwt.sign(payload, this.configService.get("JWT_REFRESH_TOKEN_SECRET"), {
      expiresIn: `${this.configService.get("JWT_REFRESH_TOKEN_EXPIRATION_TIME")}s`,
    })
    const cookie = `refreshToken=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      "JWT_REFRESH_TOKEN_EXPIRATION_TIME",
    )}`

    return { token, cookie }
  }

  private async verifyPassword(plainTextPassword: string, hashedPassword: string): Promise<void> {
    const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword)
    if (!isPasswordMatching) {
      throw new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, "Wrong credentials provided")
    }
  }

  async generatePassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(Number(this.configService.get("SALT")))
    return await bcrypt.hash(password, salt)
  }
}
