import { Post } from "@prisma/client"
import { IsEmpty, IsOptional, IsString, Length, IsBoolean } from "class-validator"

export class PostUpdateDto implements Omit<Post, "id" | "userId"> {
  @IsOptional()
  @IsString()
  @Length(3)
  title: string

  @IsOptional()
  @IsString()
  @Length(10)
  text: string

  @IsOptional()
  tags: { id: string }[]

  @IsEmpty()
  viewsCount: number

  @IsBoolean()
  @IsOptional()
  isPublish: boolean

  @IsEmpty()
  createdAt: Date

  @IsEmpty()
  updatedAt: Date
}
