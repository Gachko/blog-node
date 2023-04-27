import { Post } from "@prisma/client"
import { IsDefined, IsEmpty, IsOptional, IsString, Length } from "class-validator"

export class PostCreateDto implements Omit<Post, "id" | "userId"> {
  @IsDefined()
  @IsString()
  @Length(3)
  title: string

  @IsDefined()
  @IsString()
  @Length(10)
  text: string

  @IsOptional()
  tags: { id: string }[]

  @IsEmpty()
  viewsCount: number

  @IsEmpty()
  isPublish: boolean

  @IsEmpty()
  createdAt: Date

  @IsEmpty()
  updatedAt: Date

}
