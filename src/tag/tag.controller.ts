import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TagService } from './tag.service';
import JwtAuthenticationGuard from '../auth/guards/jwtAuthentication.guard';
import { Roles } from '../common/guards/roles.decorator';
import { Role } from '@prisma/client';
import { TagCreateDTO } from './dto/createTag.dto';

@Controller('tag')
export class TagController {
  constructor(private tagService: TagService) {}

  @Get()
  async getTags() {
    return this.tagService.find();
  }

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  @Roles(Role.ADMIN)
  async createTag(@Body() tag: TagCreateDTO) {
    return this.tagService.create(tag);
  }

  @Delete(':id')
  @UseGuards(JwtAuthenticationGuard)
  @Roles(Role.ADMIN)
  async deleteTag(@Param('id') id: string) {
    return this.tagService.delete(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthenticationGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async getTag(@Param('id') id: string) {
    return this.tagService.findById(id);
  }
}
