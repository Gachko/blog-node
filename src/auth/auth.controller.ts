import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/userLogin.dto';
import { UserCreateDto } from '../user/dto/userCreate.dto';
import { AuthGuard } from './guards/auth.guard';
import { GetToken } from '../common/decorators/authorizationReq.decorator';
import { ConvertTokenPipe } from '../common/pipes/convertToken.pipe';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() user: UserCreateDto) {
    return this.authService.register(user)
  }
   @Post('login')
   @HttpCode(HttpStatus.OK)
   login(@Body() user: UserLoginDto) {
     return this.authService.login(user)
   }

    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@GetToken() token: string) {
    return this.authService.getProfile(token)
   }
}