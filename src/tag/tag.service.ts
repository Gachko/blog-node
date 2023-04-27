import { ITagService } from "./tag.service.interface"
import { TagCreateDTO } from "./dto/create-tag.dto"
import { Tag } from "@prisma/client"
import { inject, injectable } from "inversify"
import "reflect-metadata"
import { TYPES } from "../common/constants/types"
import { ITagRepository } from "./tag.repository.interface"
import { HttpError } from "../common/errors/http-error"
import { StatusCodes } from "http-status-codes"

@injectable()
export class TagService implements ITagService {
  constructor(@inject(TYPES.ITagRepository) private tagRepository: ITagRepository) {}
  async createTag(tag: TagCreateDTO): Promise<Tag> {
    const existedTag = await this.tagRepository.findByTitle(tag.title)
    if (existedTag) {
      throw new HttpError(StatusCodes.CONFLICT, "Tag already exists")
    }
    const newTag = await this.tagRepository.create(tag)
    return newTag
  }
  async getTags(): Promise<Tag[]> {
    return await this.tagRepository.find()
  }
  async getTagById(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findById(id)
    if (!tag) throw new HttpError(StatusCodes.NOT_FOUND, "Tag not found")
    return tag
  }

  async deleteTagById(id: string): Promise<void> {
    await this.tagRepository.delete(id)
  }
}
