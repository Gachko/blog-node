import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Post, Role, User } from '@prisma/client';
import { PostCreateDto } from './dto/postCreate.dto';
import { PostUpdateDto } from './dto/postUpdate.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async find(): Promise<Post[]> {
    return await this.prisma.post.findMany({
      where: {
        isPublish: true,
      },
      include: {
        tags: true,
      },
    });
  }

  async update(id: string, post: PostUpdateDto, user: User): Promise<Post> {
    const existedPost = await this.findById(id);
    if (!existedPost) throw new NotFoundException('Post not found');
    if (!this.isAccessible(user, id))
      throw new ForbiddenException('Access denied');
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
    });
  }

  async create(post: PostCreateDto, user: User): Promise<Post> {
    let isPublish = false;
    if (user.role === Role.ADMIN) isPublish = true;
    return await this.prisma.post.create({
      data: {
        title: post.title,
        text: post.text,
        userId: user.id,
        isPublish,
        tags: {
          connect: post.tags,
        },
      },
      include: { tags: true },
    });
  }

  async findById(id: string): Promise<Post> {
    const post = await this.prisma.post.findFirst({
      where: { id },
      include: { tags: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async delete(id: string, user: User): Promise<Post> {
    const post = await this.prisma.post.findFirst({
      where: { id },
      include: { tags: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    if (!this.isAccessible(user, id))
      throw new ForbiddenException('Access denied');
    return await this.prisma.post.delete({ where: { id } });
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
    });
  }

  async getUnpublishedPosts(user: User) {
    const posts = await this.prisma.post.findMany({
      include: {
        tags: true,
      },
    });
    if (user.role === Role.ADMIN) return posts;
    return posts.filter((post) => post.id === user.id);
  }

  private isAccessible(user: User, postId: string): boolean {
    return (
      user?.role === Role.ADMIN ||
      (user?.role === Role.MANAGER && postId === user?.id)
    );
  }
}
