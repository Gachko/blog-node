import { User, Status, Role } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export class UserUpdateDto implements Pick<User, 'role' | 'status'> {
  @IsOptional()
  @IsString()
  role: Role;

  @IsOptional()
  @IsString()
  status: Status;
}
