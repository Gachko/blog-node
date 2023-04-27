import { User } from "@prisma/client"

export interface ITokenPayload {
  id: User["id"]
  email: User["email"]
  role: User["role"]
}
