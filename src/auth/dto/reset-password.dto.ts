import { IsDefined, IsEmail } from "class-validator"

export class ResetPasswordDto {
  @IsDefined()
  @IsEmail()
  email: string
}
