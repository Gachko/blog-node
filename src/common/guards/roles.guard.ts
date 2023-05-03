import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = this.parseCookie(request.headers.cookie)?.Authentication;
    if (!token) return false;
    const decoded = await this.jwtService.verify(token, {
      secret: '1234',
    });
    return this.validateRoles(roles, decoded?.role);
  }

  private validateRoles(roles: string[], userRole: string) {
    return roles.some((role) => userRole.includes(role));
  }

  private parseCookie(cookie: string) {
    const parsedObj: { [key: string]: string } = {};
    cookie.split(';').forEach((item) => {
      const arrayFromItem = item.split('=');
      parsedObj[arrayFromItem[0]] = arrayFromItem[1];
    });
    return parsedObj;
  }
}
