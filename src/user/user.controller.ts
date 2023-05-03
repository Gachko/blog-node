import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import JwtAuthenticationGuard from '../auth/guards/jwtAuthentication.guard';
import RequestWithUser from '../auth/interfaces/requestWithUser.interface';
import { Response } from 'express';
import UserDTO from './dto/user.dto';
import { Roles } from '../common/guards/roles.decorator';
import { Role } from '@prisma/client';
import { UserService } from './user.service';
import { UserUpdateDto } from './dto/userUpdate.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthenticationGuard)
  @Roles(Role.ADMIN)
  getUsers() {
    return this.userService.getUsers();
  }

  @Get('profile')
  @UseGuards(JwtAuthenticationGuard)
  getProfile(@Req() req: RequestWithUser, @Res() res: Response) {
    const { user } = req;
    return res.send(new UserDTO(user));
  }

  @Patch(':id')
  @UseGuards(JwtAuthenticationGuard)
  @Roles(Role.ADMIN)
  async editUser(@Param('id') id: string, @Body() user: UserUpdateDto) {
    return this.userService.update(user, id);
  }
}
