import "reflect-metadata"
import { ICommentRepository } from "../comment.repository.interface"
import { Container } from "inversify"
import { ICommentService } from "../comment.service.interface"
import { TYPES } from "../../common/constants/types"
import { CommentService } from "../comment.service"
import { Comment, Role } from "@prisma/client"

const CommentRepositoryMock: ICommentRepository = {
  create: jest.fn(),
  delete: jest.fn(),
  publish: jest.fn(),
  findMany: jest.fn(),
}

const container = new Container()
let commentRepository: ICommentRepository
let commentService: ICommentService

beforeAll(() => {
  container.bind<ICommentRepository>(TYPES.ICommentRepository).toConstantValue(CommentRepositoryMock)
  container.bind<ICommentService>(TYPES.ICommentService).to(CommentService)
  commentRepository = container.get<ICommentRepository>(TYPES.ICommentRepository)
  commentService = container.get<ICommentService>(TYPES.ICommentService)
})

let createdComment: Comment | null

const userId = "12345"

const TokenPayloadUser = {
  id: userId,
  email: "test@mail.ru",
  role: Role.USER,
}

const testComments = [
  {
    id: "id1",
    text: "sometext",
    isPublish: true,
    postId: "post1",
    userId: "userId",
    createdAt: "2023-03-21 18:14:51.317",
    updatedAt: "2023-03-21 18:14:51.317",
  },
  {
    id: "id1",
    text: "sometext",
    isPublish: false,
    postId: "post1",
    userId: "userId",
    createdAt: "2023-03-21 18:14:51.317",
    updatedAt: "2023-03-21 18:14:51.317",
  },
]

describe("Comment service", () => {
  it("create comment", async () => {
    commentRepository.create = jest.fn().mockImplementationOnce((userId: string, comment: Comment) => ({
      id: "id1",
      text: comment.text,
      isPublish: comment.isPublish,
      postId: comment.postId,
      userId: userId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }))
    createdComment = await commentService.create(TokenPayloadUser, {
      text: "some text",
      postId: "postId",
      isPublish: false,
      createdAt: new Date("2023-03-21 18:14:51.317"),
      updatedAt: new Date("2023-03-21 18:14:51.317"),
    })
    expect(createdComment).not.toBeNull()
    expect(createdComment?.id).toEqual("id1")
  })
  it("delete comment", async () => {
    commentRepository.delete = jest.fn().mockImplementationOnce(() => void 0)
    const deletedComment = await commentService.delete("id1")
    expect(deletedComment).toBe(void 0)
  })
  it("publish comment", async () => {
    commentRepository.publish = jest.fn().mockImplementationOnce(() => void 0)
    const publishedComment = await commentService.publishComment("id1")
    expect(publishedComment).toBe(void 0)
  })
  it("get unpublish comment by post id", async () => {
    commentRepository.findMany = jest.fn().mockImplementationOnce(() => [testComments[1]])
    const expectedComments = await commentService.getUnpublishedCommentsByPostId("post1")
    expect(expectedComments).toEqual([testComments[1]])
  })
  it("get publish comment by post id", async () => {
    commentRepository.findMany = jest.fn().mockImplementationOnce(() => [testComments[0]])
    const expectedComments = await commentService.getUnpublishedCommentsByPostId("post1")
    expect(expectedComments).toEqual([testComments[0]])
  })
})
