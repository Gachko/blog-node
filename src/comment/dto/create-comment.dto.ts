import { Comment } from "@prisma/client"
import { IsString, IsDefined, IsEmpty } from "class-validator"

export class CreateCommentDto implements Omit<Comment, "id" | "userId" > {
  @IsDefined()
  @IsString()
  text: string

  @IsDefined()
  @IsString()
  postId: string

  @IsEmpty()
  isPublish: boolean

  @IsEmpty()
  createdAt: Date

  @IsEmpty()
  updatedAt: Date
}
