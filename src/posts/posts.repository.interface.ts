import { Post } from "@prisma/client"
import { PostUpdateDto } from "./dto/post-update.dto"
import { PostCreateDto } from "./dto/post-create.dto"

export interface IPostsRepository {
  find: () => Promise<Post[]>
  update: (id: string, post: PostUpdateDto) => Promise<Post>
  create: (post: PostCreateDto, userId: string) => Promise<Post>
  delete: (id: string) => Promise<Post>
  findById: (id: string) => Promise<Post | null>
  findByTagId: (tagId: string) => Promise<Post[]>
}
