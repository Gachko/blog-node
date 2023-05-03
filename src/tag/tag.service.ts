import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Tag } from '@prisma/client';
import { TagCreateDTO } from './dto/createTag.dto';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  async find(): Promise<Tag[]> {
    return await this.prisma.tag.findMany();
  }

  async create(tag: TagCreateDTO): Promise<Tag> {
    const existedTag = await this.findByTitle(tag.title);
    if (existedTag) {
      throw new ConflictException('Tag already exists');
    }
    return await this.prisma.tag.create({ data: tag });
  }

  async delete(id: string): Promise<Tag> {
    return await this.prisma.tag.delete({ where: { id } });
  }

  async findById(id: string): Promise<Tag | null> {
    const tag = await this.prisma.tag.findFirst({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async findByTitle(title: string): Promise<Tag | null> {
    return await this.prisma.tag.findFirst({ where: { title } });
  }
}
