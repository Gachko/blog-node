import { ICommentRepository } from "./comment.repository.interface"
import "reflect-metadata"
import { inject, injectable } from "inversify"
import { CreateCommentDto } from "./dto/create-comment.dto"
import { Comment } from "@prisma/client"
import { TYPES } from "../common/constants/types"
import { DatabaseService } from "../common/database/database.service"

@injectable()
export class CommentRepository implements ICommentRepository {
  constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {}
  async create(userId: string, comment: CreateCommentDto): Promise<Comment> {
    return await this.databaseService.client.comment.create({ data: { ...comment, userId } })
  }

  async delete(id: string): Promise<Comment> {
    return await this.databaseService.client.comment.delete({ where: { id } })
  }

  async publish(id: string): Promise<Comment> {
    return await this.databaseService.client.comment.update({ where: { id }, data: { isPublish: true } })
  }

  async findMany(postId: string, isPublish: boolean): Promise<Comment[]> {
    const query = { where: { isPublish, postId } }
    return await this.databaseService.client.comment.findMany({
      ...query,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }
}
