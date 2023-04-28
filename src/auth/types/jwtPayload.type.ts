import { Role, User } from '@prisma/client';

export class JwtPayloadType {
  name: string
  email: string
  role: Role
  id: string
  constructor(user: User) {
    this.name = user.name
    this.email = user.email
    this.role = user.role
    this.id = user.id
  }
  getPayload() {
    return {
      email: this.email,
      name: this.name,
      role: this.role,
      id: this.id
    }
  }
}