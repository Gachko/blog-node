import { PrismaClient } from "@prisma/client"
import { inject, injectable } from "inversify"
import "reflect-metadata"
import { TYPES } from "../constants/types"
import { ILoggerService } from "../logger/logger.service.interface"

@injectable()
export class DatabaseService {
  client: PrismaClient

  constructor(@inject(TYPES.ILoggerService) private loggerService: ILoggerService) {
    this.client = new PrismaClient()
  }

  async connect(): Promise<void> {
    try {
      await this.client.$connect()
      this.loggerService.log(`[DatabaseService]:Successful database connection`)
    } catch (e) {
      if (e instanceof Error) {
        this.loggerService.error(`[DatabaseService]: Error in Database connection: ${e.message}`)
      }
    }
  }
  async disconnect(): Promise<void> {
    await this.client.$disconnect()
  }
}
