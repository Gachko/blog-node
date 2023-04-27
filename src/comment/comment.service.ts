import { ICommentService } from "./comment.service.interface"
import "reflect-metadata"
import { inject, injectable } from "inversify"
import { ICommentRepository } from "./comment.repository.interface"
import { TYPES } from "../common/constants/types"
import { ITokenPayload } from "../common/interface/tokenPayload.interface"
import { Comment, Role } from "@prisma/client"
import { CreateCommentDto } from "./dto/create-comment.dto"

@injectable()
export class CommentService implements ICommentService {
  constructor(@inject(TYPES.ICommentRepository) private commentRepository: ICommentRepository) {}

  async create(user: ITokenPayload, comment: CreateCommentDto): Promise<Comment> {
    if (user.role === Role.ADMIN) {
      comment.isPublish = true
    }
    return await this.commentRepository.create(user.id, comment)
  }

  async delete(id: string): Promise<void> {
    await this.commentRepository.delete(id)
  }

  async publishComment(id: string): Promise<void> {
    await this.commentRepository.publish(id)
  }

  async getPublishedCommentsByPostId(postId: string): Promise<Comment[]> {
    return await this.commentRepository.findMany(postId, true)
  }

  async getUnpublishedCommentsByPostId(postId: string): Promise<Comment[]> {
    return await this.commentRepository.findMany(postId, false)
  }
}
