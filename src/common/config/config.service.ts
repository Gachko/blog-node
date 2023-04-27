import { inject, injectable } from "inversify"
import "reflect-metadata"
import { IConfigService } from "./config.service.interface"
import { config, DotenvConfigOutput, DotenvParseOutput } from "dotenv"
import { TYPES } from "../constants/types"
import { ILoggerService } from "../logger/logger.service.interface"

@injectable()
export class ConfigService implements IConfigService {
  private config: DotenvParseOutput
  constructor(@inject(TYPES.ILoggerService) private loggerService: ILoggerService) {
    const result: DotenvConfigOutput = config()
    if (result.error) {
      this.loggerService.error(`[ConfigService]: The .env file could not be read`)
    } else {
      this.loggerService.log(`[ConfigService]: .env file loaded`)
      this.config = result.parsed as DotenvParseOutput
    }
  }

  get(key: string): string {
    return this.config[key]
  }
}
