import { StatusCodes } from "http-status-codes"

export class HttpError extends Error {
  statusCode: StatusCodes
  context?: string
  constructor(statusCode: StatusCodes, message: string, content?: string) {
    super(message)
    this.statusCode = statusCode
    this.context = content
  }
}
