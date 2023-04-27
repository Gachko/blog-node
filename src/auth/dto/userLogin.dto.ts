import { User } from "@prisma/client"
import { IsDefined, IsEmail, IsString } from "class-validator"

export class UserLoginDto implements Pick<User, "email" | "password"> {
  @IsDefined()
  @IsEmail()
  email: string

  @IsDefined()
  @IsString()
  password: string
}