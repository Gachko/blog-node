import { Post } from "@prisma/client"
import "reflect-metadata"
import { inject, injectable } from "inversify"
import { TYPES } from "../common/constants/types"
import { IPostsRepository } from "./posts.repository.interface"
import { PostUpdateDto } from "./dto/post-update.dto"
import { DatabaseService } from "../common/database/database.service"
import { PostCreateDto } from "./dto/post-create.dto"

@injectable()
export class PostsRepository implements IPostsRepository {
  constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {}

  async find(): Promise<Post[]> {
    return await this.databaseService.client.post.findMany({
      where: {
        isPublish: true,
      },
      include: {
        tags: true,
      },
    })
  }

  async update(id: string, post: PostUpdateDto): Promise<Post> {
    return await this.databaseService.client.post.update({
      where: { id },
      data: {
        title: post.title,
        text: post.text,
        tags: {
          connect: post.tags,
        },
      },
      include: { tags: true },
    })
  }

  async create(post: PostCreateDto, userId: string): Promise<Post> {
    return await this.databaseService.client.post.create({
      data: {
        title: post.title,
        text: post.text,
        userId,
        tags: {
          connect: post.tags,
        },
      },
      include: { tags: true },
    })
  }

  async delete(id: string): Promise<Post> {
    return await this.databaseService.client.post.delete({ where: { id } })
  }

  async findById(id: string): Promise<Post> {
    return await this.databaseService.client.post.findUniqueOrThrow({
      where: { id },
      include: { tags: true },
    })
  }

  async findByTagId(tagId: string): Promise<Post[]> {
    return await this.databaseService.client.post.findMany({
      where: {
        isPublish: true,
        tags: {
          some: {
            id: tagId,
          },
        },
      },
      include: {
        tags: true,
      },
    })
  }
}
