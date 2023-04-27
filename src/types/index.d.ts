import { ITokenPayload } from "../common/interface/tokenPayload.interface"

export {}

declare global {
  namespace Express {
    interface Request {
      token: ITokenPayload
    }
  }
}
