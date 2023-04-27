import { User, Status, Role } from "@prisma/client"
import { IsDefined, IsEmail, IsEmpty, IsString } from "class-validator"

export class UserCreateDto implements Omit<User, "id"> {
  @IsDefined()
  @IsEmail()
  email: string

  @IsDefined()
  @IsString()
  password: string

  @IsDefined()
  @IsString()
  name: string

  @IsEmpty()
  status: Status

  @IsEmpty()
  role: Role

  @IsEmpty()
  createdAt: Date

  @IsEmpty()
  updatedAt: Date
}