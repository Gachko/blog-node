import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadType } from '../../auth/types/jwtPayload.type';

export async function parseTokenMiddleware (req: Request, res: Response, next: NextFunction){
  const jwtService = new JwtService()
   const token = req.headers.authorization.split(' ')[1]
    if(!token) return next()
    try {
      const decoded = await jwtService.verify(
        token,
        {
          secret: '1234'
        }
      ) as JwtPayloadType
      console.log(decoded, '124354')
      req.token = decoded
      return next()
    } catch (e) {
      console.log(e)
      return next()
    }
}
