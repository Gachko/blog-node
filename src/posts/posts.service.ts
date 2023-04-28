import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {Post} from '@prisma/client';
import { PostCreateDto } from './dto/postCreate.dto';
import { PostUpdateDto } from './dto/postUpdate.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async find(): Promise<Post[]> {
    return await this.prisma.post.findMany({
      where: {
        isPublish: true
      },
      include: {
        tags: true
      }
    })
  }

  async update(id: string, post: PostUpdateDto): Promise<Post> {
    return await this.prisma.post.update({
      where: { id },
      data: {
        title: post.title,
        text: post.text,
        tags: {
          connect: post.tags,
        },
      },
      include: { tags: true },
    })
  }

  async create(post: PostCreateDto, userId: string): Promise<Post> {
    return await this.prisma.post.create({
      data: {
        title: post.title,
        text: post.text,
        userId,
        tags: {
          connect: post.tags,
        },
      },
      include: { tags: true },
    })
  }

  async findById(id: string): Promise<Post> {
    return await this.prisma.post.findUniqueOrThrow({
      where: {id},
      include: {tags: true}
    })
  }

  async delete(id: string): Promise<Post> {
    return await this.prisma.post.delete({ where: { id } })
  }

  async findByTagId(tagId: string): Promise<Post[]> {
    return await this.prisma.post.findMany({
      where: {
        isPublish: true,
        tags: {
          some: {
            id: tagId,
          },
        },
      },
      include: {
        tags: true,
      },
    })
  }
}