import { Tag } from "@prisma/client"
import { TagCreateDTO } from "./dto/create-tag.dto"

export interface ITagService {
  createTag: (tag: TagCreateDTO) => Promise<Tag>
  getTags: () => Promise<Tag[]>
  getTagById: (id: string) => Promise<Tag>
  deleteTagById: (id: string) => Promise<void>
}
