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
import { PostsService } from './posts.service';
import { Post as PostType, Role } from '@prisma/client';
import JwtAuthenticationGuard from '../auth/guards/jwtAuthentication.guard';
import { Roles } from '../common/guards/roles.decorator';
import { PostUpdateDto } from './dto/postUpdate.dto';
import RequestWithUser from '../auth/interfaces/requestWithUser.interface';
import { PostCreateDto } from './dto/postCreate.dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  getPosts(): Promise<PostType[]> {
    return this.postsService.find();
  }

  @Get('tag/:id')
  getPostsByTagId(@Param('id') id: string): Promise<PostType[]> {
    return this.postsService.findByTagId(id);
  }

  @Get('unpublished')
  @UseGuards(JwtAuthenticationGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  getUnpublishedPosts(@Req() req: RequestWithUser): Promise<PostType[]> {
    const { user } = req;
    return this.postsService.getUnpublishedPosts(user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthenticationGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  updatePost(
    @Param('id') id: string,
    @Body() post: PostUpdateDto,
    @Req() req: RequestWithUser,
  ) {
    const { user } = req;
    return this.postsService.update(id, post, user);
  }

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  createPost(@Body() post: PostCreateDto, @Req() req: RequestWithUser) {
    const { user } = req;
    return this.postsService.create(post, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthenticationGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  deletePost(@Param('id') id: string, @Req() req: RequestWithUser) {
    const { user } = req;
    return this.postsService.delete(id, user);
  }

  @Get(':id')
  getPost(@Param('id') id: string) {
    return this.postsService.findById(id);
  }
}
