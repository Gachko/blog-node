import { ITagRepository } from "./tag.repository.interface"
import "reflect-metadata"
import { inject, injectable } from "inversify"
import { Tag } from "@prisma/client"
import { TagCreateDTO } from "./dto/create-tag.dto"
import { TYPES } from "../common/constants/types"
import { DatabaseService } from "../common/database/database.service"

@injectable()
export class TagRepository implements ITagRepository {
  constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {}

  async find(): Promise<Tag[]> {
    return await this.databaseService.client.tag.findMany()
  }

  async create(tag: TagCreateDTO): Promise<Tag> {
    return await this.databaseService.client.tag.create({ data: tag })
  }

  async delete(id: string): Promise<Tag> {
    return await this.databaseService.client.tag.delete({ where: { id } })
  }

  async findById(id: string): Promise<Tag | null> {
    return await this.databaseService.client.tag.findFirst({ where: { id } })
  }

  async findByTitle(title: string): Promise<Tag | null> {
    return await this.databaseService.client.tag.findFirst({ where: { title } })
  }
}
