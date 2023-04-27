import "reflect-metadata"
import { Container } from "inversify"
import { ITagRepository } from "../tag.repository.interface"
import { ITagService } from "../tag.service.interface"
import { TYPES } from "../../common/constants/types"
import { TagService } from "../tag.service"
import { Tag } from "@prisma/client"

const TagRepositoryMock: ITagRepository = {
  find: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  findById: jest.fn(),
  findByTitle: jest.fn(),
}

const container = new Container()
let tagRepository: ITagRepository
let tagService: ITagService

beforeAll(() => {
  container.bind<ITagService>(TYPES.ITagService).to(TagService)
  container.bind<ITagRepository>(TYPES.ITagRepository).toConstantValue(TagRepositoryMock)

  tagRepository = container.get<ITagRepository>(TYPES.ITagRepository)
  tagService = container.get<ITagService>(TYPES.ITagService)
})

let createdTag: Tag | null

describe("Tag Service", () => {
  it("create tag", async () => {
    tagRepository.create = jest.fn().mockImplementationOnce((tag: Tag) => ({
      title: tag.title,
      id: "1",
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    }))
    createdTag = await tagService.createTag({
      title: "Some tag",
      createdAt: new Date("2023-03-21 18:14:51.317"),
      updatedAt: new Date("2023-03-21 18:14:51.317"),
    })
    expect(createdTag?.id).toEqual("1")
    expect(createdTag).not.toBeNull()
  })
  it("find tag", async () => {
    const tags = [
      {
        title: "Some tag",
        id: "1",
        createdAt: "2023-03-21 18:14:51.317",
        updatedAt: "2023-03-21 18:14:51.317",
      },
      {
        title: "Some tag 2",
        id: "2",
        createdAt: "2023-03-21 18:14:51.317",
        updatedAt: "2023-03-21 18:14:51.317",
      },
    ]
    tagRepository.find = jest.fn().mockImplementationOnce(() => tags)
    const expectedTags = await tagService.getTags()
    expect(expectedTags).toEqual(tags)
  })
  it("get tag by id", async () => {
    tagRepository.findById = jest.fn().mockImplementationOnce(() => createdTag)
    const expectedTag = await tagService.getTagById("1")
    expect(expectedTag).toEqual(createdTag)
    expect(expectedTag?.id).toEqual("1")
  })
  it("delete tag by id", async () => {
    tagRepository.delete = jest.fn().mockImplementationOnce(() => void 0)
    const deletingTag = await tagService.deleteTagById("1")
    expect(deletingTag).toBe(void 0)
  })
})
