import { Post } from "@prisma/client"
import { PostUpdateDto } from "./dto/post-update.dto"
import { PostCreateDto } from "./dto/post-create.dto"
import { ITokenPayload } from "../common/interface/tokenPayload.interface"

export interface IPostService {
  getPosts: () => Promise<Post[]>
  getAccessiblePosts: (user: ITokenPayload) => Promise<Post[]>
  editPost: (id: string, post: PostUpdateDto, user: ITokenPayload) => Promise<Post>
  createPost: (post: PostCreateDto, userId: string) => Promise<Post>
  getPostById: (id: string, user: ITokenPayload) => Promise<Post | null>
  deletePost: (id: string, user: ITokenPayload) => Promise<void>
  getPostsByTag: (tagId: string) => Promise<Post[]>
}
