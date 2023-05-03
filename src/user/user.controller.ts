import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';

import JwtAuthenticationGuard from '../auth/guards/jwtAuthentication.guard';
import RequestWithUser from '../auth/interfaces/requestWithUser.interface';
import { Response } from 'express';
import UserDTO from './dto/user.dto';

@Controller('user')
export class UserController {
  @Get('profile')
  @UseGuards(JwtAuthenticationGuard)
  getProfile(@Req() req: RequestWithUser, @Res() res: Response) {
    const { user } = req;
    return res.send(new UserDTO(user));
  }
}
