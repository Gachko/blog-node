import { JwtPayloadType } from './auth/types/jwtPayload.type';

export {}

declare global {
  namespace Express {
    interface Request {
      token: JwtPayloadType
    }
  }
}