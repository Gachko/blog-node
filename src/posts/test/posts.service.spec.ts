import "reflect-metadata"
import { IPostsRepository } from "../posts.repository.interface"
import { Post, Role } from "@prisma/client"
import { Container } from "inversify"
import { IPostService } from "../posts.service.interface"
import { TYPES } from "../../common/constants/types"
import { PostsService } from "../posts.service"

const PostsRepositoryMock: IPostsRepository = {
  find: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  findById: jest.fn(),
  findByTagId: jest.fn(),
}

const container = new Container()
let postsRepository: IPostsRepository
let postsService: IPostService

beforeAll(() => {
  container.bind<IPostService>(TYPES.IPostService).to(PostsService)
  container.bind<IPostsRepository>(TYPES.IPostsRepository).toConstantValue(PostsRepositoryMock)

  postsRepository = container.get<IPostsRepository>(TYPES.IPostsRepository)
  postsService = container.get<IPostService>(TYPES.IPostService)
})

let createdPost: Post | null

const userId = "12345"
const adminId = "123456"

const TokenPayloadUser = {
  id: userId,
  email: "test@mail.ru",
  role: Role.USER,
}

const TokenPayloadAdmin = {
  id: adminId,
  email: "testAdmin@mail.ru",
  role: Role.ADMIN,
}

const tags = [{id: "tag1", title: "Tag title"}]

describe("Post service", () => {
  it("create post", async () => {
    postsRepository.create = jest.fn().mockImplementationOnce((post: Post, userId: string) => ({
      id: "1",
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      title: post.title,
      text: post.text,
      viewsCount: post.viewsCount,
      isPublish: post.isPublish,
      userId: userId,
      tags,
    }))
    createdPost = await postsService.createPost(
      {
        title: "Title 1",
        text: "Some text",
        tags,
        viewsCount: 0,
        isPublish: true,createdAt: new Date("2023-03-21 18:14:51.317"),
        updatedAt: new Date("2023-03-21 18:14:51.317"),

      },
      userId,
    )

    expect(createdPost?.id).toEqual("1")
    expect(createdPost).not.toBeNull()
  })
  it("find all posts", async () => {
    const posts = [
      {
        id: "1",
        createdAt: "2023-03-21 18:14:51.317",
        updatedAt: "2023-03-21 18:14:51.317",
        title: "Title 1",
        text: "Text 1",
        viewsCount: 2,
        isPublish: true,
        userId: userId,
        tags: [],
      },
      {
        id: "2",
        createdAt: "2023-03-21 18:14:51.317",
        updatedAt: "2023-03-21 18:14:51.317",
        title: "Title 2",
        text: "Text 2",
        viewsCount: 2,
        isPublish: true,
        userId: userId,
        tags: [],
      },
    ]
    postsRepository.find = jest.fn().mockImplementationOnce(() => posts)
    const expectedPosts = await postsService.getPosts()
    expect(expectedPosts).toEqual(posts)
  })
  it("update post", async () => {
    postsRepository.findById = jest.fn().mockImplementationOnce(() => createdPost)
    postsRepository.update = jest.fn().mockImplementationOnce((postId: string,post: Post, userId: string) => ({
     ...createdPost,
      userId: userId,
      title: post.title,
      text: post.text,
      tags,
      viewsCount: 0,
      isPublish: true,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }))
    const editedPost = await postsService.editPost("1",{
      title: "New Title 1",
      text: "New Some text",
      tags,
      viewsCount: 0,
      isPublish: true,
      createdAt: new Date("2023-03-21 18:14:51.317"),
      updatedAt: new Date("2023-03-21 18:14:51.317"),
    } ,TokenPayloadAdmin)
    expect(editedPost?.title).toEqual("New Title 1")
    expect(editedPost?.text).toEqual("New Some text")
  })
  it("delete post", async () => {
    postsRepository.findById = jest.fn().mockImplementationOnce(() => createdPost)
    postsRepository.delete = jest.fn().mockImplementationOnce(() => void 0)
    const deletedPost = await postsService.deletePost("1", TokenPayloadAdmin)
    expect(deletedPost).toBe(void 0)
  })
  it("find post by id", async () => {
    postsRepository.findById = jest.fn().mockImplementationOnce(() => createdPost)
    const expectedPost = await postsService.getPostById("1", TokenPayloadUser)
    expect(expectedPost).toEqual(createdPost)
    expect(expectedPost?.id).toEqual("1")
  })
  it("find post by tag id", async () => {
    postsRepository.findByTagId = jest.fn().mockImplementationOnce(() => createdPost)
    const expectedPost = await postsService.getPostsByTag("tag1")
    expect(expectedPost).toEqual(createdPost)

  })
})
