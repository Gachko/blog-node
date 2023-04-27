import { ITokenPayload } from "../common/interface/tokenPayload.interface"
import { CreateCommentDto } from "./dto/create-comment.dto"
import { Comment } from "@prisma/client"

export interface ICommentService {
  create: (user: ITokenPayload, comment: CreateCommentDto) => Promise<Comment>
  delete: (id: string) => Promise<void>
  publishComment: (id: string) => Promise<void>
  getUnpublishedCommentsByPostId: (postId: string) => Promise<Comment[]>
  getPublishedCommentsByPostId: (postId: string) => Promise<Comment[]>
}
