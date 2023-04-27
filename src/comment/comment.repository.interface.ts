import { CreateCommentDto } from "./dto/create-comment.dto"
import { Comment } from "@prisma/client"

export interface ICommentRepository {
  create: (userId: string, comment: CreateCommentDto) => Promise<Comment>
  delete: (id: string) => Promise<Comment>
  publish: (id: string) => Promise<Comment>
  findMany: (postId: string, isPublish: boolean) => Promise<Comment[]>
}
