import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import JwtAuthenticationGuard from '../auth/guards/jwtAuthentication.guard';
import { Roles } from '../common/guards/roles.decorator';
import { Role } from '@prisma/client';
import RequestWithUser from '../auth/interfaces/requestWithUser.interface';
import { CreateCommentDto } from './dto/createComment.dto';

@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  async createComment(
    @Body() comment: CreateCommentDto,
    @Req() req: RequestWithUser,
  ) {
    const { user } = req;
    return this.commentService.createComment(user, comment);
  }

  @Delete(':id')
  @UseGuards(JwtAuthenticationGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async deleteComment(@Param('id') id: string) {
    return this.commentService.deleteComment(id);
  }

  @Patch('publish/:id')
  @UseGuards(JwtAuthenticationGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async publishComment(@Param('id') id: string) {
    return this.commentService.publishComment(id);
  }

  @Get('published/:postId')
  async getPublishedComment(@Param('postId') postId: string) {
    return this.commentService.findPublishedComments(postId);
  }

  @Get('unpublished/:postId')
  @UseGuards(JwtAuthenticationGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async getUnpublishedComment(@Param('postId') postId: string) {
    return this.commentService.findUnpublishedComments(postId);
  }
}
