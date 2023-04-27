import { Tag } from "@prisma/client"
import { TagCreateDTO } from "./dto/create-tag.dto"

export interface ITagRepository {
  find: () => Promise<Tag[]>
  create: (tag: TagCreateDTO) => Promise<Tag>
  delete: (id: string) => Promise<Tag>
  findById: (id: string) => Promise<Tag | null>
  findByTitle: (title: string) => Promise<Tag | null>
}
