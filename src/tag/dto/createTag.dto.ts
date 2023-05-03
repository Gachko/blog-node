import { Tag } from '@prisma/client';
import { IsDefined, IsEmpty, IsString, Length } from 'class-validator';

export class TagCreateDTO implements Omit<Tag, 'id'> {
  @IsDefined()
  @IsString()
  @Length(3)
  title: string;

  @IsEmpty()
  createdAt: Date;

  @IsEmpty()
  updatedAt: Date;
}
