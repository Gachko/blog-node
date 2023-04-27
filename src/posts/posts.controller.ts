import { Controller, Get } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post } from '@prisma/client';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  getAll(): Promise<Post[]> {
    return  this.postsService.find()
  }
}