import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCommentDto } from './dto/createComment.dto';
import { Role, User } from '@prisma/client';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async createComment(user: User, comment: CreateCommentDto) {
    if (user.role === Role.ADMIN) {
      comment.isPublish = true;
    }
    return await this.prisma.comment.create({
      data: { ...comment, userId: user.id },
    });
  }

  async deleteComment(id: string) {
    return await this.prisma.comment.delete({ where: { id } });
  }

  async publishComment(id: string) {
    return await this.prisma.comment.update({
      where: { id },
      data: { isPublish: true },
    });
  }

  async findPublishedComments(postId: string) {
    return await this.findComments(postId, true);
  }

  async findUnpublishedComments(postId: string) {
    return await this.findComments(postId, false);
  }

  async findComments(postId: string, isPublish: boolean) {
    const query = { where: { isPublish, postId } };
    return await this.prisma.comment.findMany({
      ...query,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
