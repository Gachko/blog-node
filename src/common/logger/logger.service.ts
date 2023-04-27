import { ILoggerService } from "./logger.service.interface"
import "reflect-metadata"
import { injectable } from "inversify"
import { Logger, ILogObj } from "tslog"

@injectable()
export class LoggerService implements ILoggerService {
  public logger: Logger<ILogObj>
  constructor() {
    this.logger = new Logger()
  }

  log(...args: unknown[]): void {
    this.logger.info(...args)
  }
  warn(...args: unknown[]): void {
    this.logger.warn(...args)
  }
  error(...args: unknown[]): void {
    this.logger.error(...args)
  }
}
