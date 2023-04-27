import { Post, Role } from "@prisma/client"
import "reflect-metadata"
import { inject, injectable } from "inversify"
import { TYPES } from "../common/constants/types"
import { IPostService } from "./posts.service.interface"
import { IPostsRepository } from "./posts.repository.interface"
import { PostUpdateDto } from "./dto/post-update.dto"
import { PostCreateDto } from "./dto/post-create.dto"
import { ITokenPayload } from "../common/interface/tokenPayload.interface"
import { HttpError } from "../common/errors/http-error"
import { StatusCodes } from "http-status-codes"

@injectable()
export class PostsService implements IPostService {
  constructor(@inject(TYPES.IPostsRepository) private postsRepository: IPostsRepository) {}
  async getPosts(): Promise<Post[]> {
    return await this.postsRepository.find()
  }
  async editPost(id: string, post: PostUpdateDto, user: ITokenPayload): Promise<Post> {
    const existedPost = await this.postsRepository.findById(id)
    if (!existedPost) throw new HttpError(StatusCodes.NOT_FOUND, "Post not found")
    if (this.isAccessible(user, id)) {
      if (user.role !== Role.ADMIN) {
        post.isPublish = existedPost.isPublish
      }
      return await this.postsRepository.update(id, post)
    } else throw new HttpError(StatusCodes.FORBIDDEN, "Access denied")
  }
  async createPost(post: PostCreateDto, userId: string): Promise<Post> {
    return await this.postsRepository.create(post, userId)
  }
  async getPostById(id: string, user: ITokenPayload): Promise<Post | null> {
    const post = await this.postsRepository.findById(id)
    if (!post) throw new HttpError(StatusCodes.NOT_FOUND, "Post not found")
    if (this.isAccessible(user, id) || post.isPublish) return post
    else throw new HttpError(StatusCodes.FORBIDDEN, "Access denied")
  }

  async deletePost(id: string, user: ITokenPayload): Promise<void> {
    const post = await this.postsRepository.findById(id)
    if (!post) throw new HttpError(StatusCodes.NOT_FOUND, "Post not found")
    if (this.isAccessible(user, id)) {
      await this.postsRepository.delete(id)
    } else throw new HttpError(StatusCodes.FORBIDDEN, "Access denied")
  }

  async getAccessiblePosts(user: ITokenPayload): Promise<Post[]> {
    const posts = await this.postsRepository.find()
    if (user.role === Role.ADMIN) return posts
    return posts.filter((post) => post.id === user.id)
  }

  async getPostsByTag(tagId: string): Promise<Post[]> {
    return await this.postsRepository.findByTagId(tagId)
  }

  private isAccessible(user: ITokenPayload, postId: string): boolean {
    return user?.role === Role.ADMIN || (user?.role === Role.MANAGER && postId === user?.id)
  }
}
