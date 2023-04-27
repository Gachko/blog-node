import express, { Express } from "express"
import { Server } from "http"
import swaggerUI from "swagger-ui-express"
import swaggerJsDoc from "swagger-jsdoc"
import bodyParser from "body-parser"
import { injectable, inject } from "inversify"
import "reflect-metadata"
import cookieParser from "cookie-parser"
import { TYPES } from "./common/constants/types"
import { IExceptionFilter } from "./common/errors/exception.filter.interface"
import { DatabaseService } from "./common/database/database.service"
import { IPostsController } from "./posts/posts.controller.interface"
import { IAuthController } from "./auth/auth.controller.interface"
import { AuthMiddleware } from "./common/middleware/auth.middleware"
import { IConfigService } from "./common/config/config.service.interface"
import { IUserController } from "./user/user.controller.interface"
import { swaggerOptions } from "./swagger.options"
import { ITagController } from "./tag/tag.controller.interface"
import { ICommentController } from "./comment/comment.controller.interface"
import { ILoggerService } from "./common/logger/logger.service.interface"
import { createHttpTerminator } from "http-terminator"
import { HttpTerminator } from "http-terminator/dist/src/types"
import { IHealthcheckController } from "./healthcheck/healthcheck.controller.interface"
const pid = process.pid

@injectable()
export class App {
  app: Express
  server: Server
  port: number
  httpTerminator: HttpTerminator

  constructor(
    @inject(TYPES.IExceptionFilter) private exceptionFilter: IExceptionFilter,
    @inject(TYPES.IPostsController) private postController: IPostsController,
    @inject(TYPES.IAuthController) private authController: IAuthController,
    @inject(TYPES.IUserController) private userController: IUserController,
    @inject(TYPES.DatabaseService) private databaseService: DatabaseService,
    @inject(TYPES.IConfigService) private configService: IConfigService,
    @inject(TYPES.ITagController) private tagController: ITagController,
    @inject(TYPES.ICommentController) private commentController: ICommentController,
    @inject(TYPES.ILoggerService) private loggerService: ILoggerService,
    @inject(TYPES.IHealthcheckController) private healthcheckController: IHealthcheckController,
  ) {
    this.app = express()
    this.port = Number(this.configService.get("PORT"))
  }

  useExceptionFilter() {
    this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter))
  }

  useRoutes() {
    this.app.use("/api/v1/posts", this.postController.router)
    this.app.use("/api/v1/auth", this.authController.router)
    this.app.use("/api/v1/user", this.userController.router)
    this.app.use("/api/v1/tag", this.tagController.router)
    this.app.use("/api/v1/comment", this.commentController.router)
    this.app.use("/api/v1/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJsDoc(swaggerOptions)))
    this.app.use("/api/v1/healthcheck", this.healthcheckController.router)
  }

  useMiddleware(): void {
    this.app.use(bodyParser.json())
    this.app.use(cookieParser())
    const authMiddleware = new AuthMiddleware(this.configService.get("JWT_ACCESS_TOKEN_SECRET"))
    this.app.use(authMiddleware.execute.bind(authMiddleware))
  }

  public async init(): Promise<void> {
    this.useMiddleware()
    this.useRoutes()
    this.useExceptionFilter()
    await this.databaseService.connect()
    this.server = this.app.listen(this.port)
    this.httpTerminator = createHttpTerminator({ server: this.server })
    this.loggerService.log(`Server works: http://localhost:${this.port} ${pid}`)
  }

  public async close(): Promise<void> {
    await this.databaseService.disconnect()
    await this.httpTerminator.terminate()
  }
}
