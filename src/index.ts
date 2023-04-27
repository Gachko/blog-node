import { App } from "./app"
import { PostController } from "./posts/posts.controller"
import { Container, ContainerModule, interfaces } from "inversify"
import { IExceptionFilter } from "./common/errors/exception.filter.interface"
import { ExceptionFilter } from "./common/errors/exception.filter"
import { DatabaseService } from "./common/database/database.service"
import { TYPES } from "./common/constants/types"
import { PostsService } from "./posts/posts.service"
import { PostsRepository } from "./posts/posts.repository"
import { IPostService } from "./posts/posts.service.interface"
import { IPostsRepository } from "./posts/posts.repository.interface"
import { IPostsController } from "./posts/posts.controller.interface"
import { UserRepository } from "./user/user.repository"
import { AuthService } from "./auth/auth.service"
import { AuthController } from "./auth/auth.controller"
import { IConfigService } from "./common/config/config.service.interface"
import { ConfigService } from "./common/config/config.service"
import { IAuthController } from "./auth/auth.controller.interface"
import { IAuthService } from "./auth/auth.service.interface"
import { IUserRepository } from "./user/user.repository.interface"
import { IUserService } from "./user/user.service.interface"
import { UserService } from "./user/user.service"
import { MailerService } from "./mailer/mailer.service"
import { IMailerService } from "./mailer/mailer.service.interface"
import { IUserController } from "./user/user.controller.interface"
import { UserController } from "./user/user.controller"
import { ITagRepository } from "./tag/tag.repository.interface"
import { TagRepository } from "./tag/tag.repository"
import { ITagService } from "./tag/tag.service.interface"
import { TagService } from "./tag/tag.service"
import { ITagController } from "./tag/tag.controller.interface"
import { TagController } from "./tag/tag.controller"
import { ICommentController } from "./comment/comment.controller.interface"
import { CommentController } from "./comment/comment.controller"
import { ICommentService } from "./comment/comment.service.interface"
import { CommentService } from "./comment/comment.service"
import { ICommentRepository } from "./comment/comment.repository.interface"
import { CommentRepository } from "./comment/comment.repository"
import { LoggerService } from "./common/logger/logger.service"
import { ILoggerService } from "./common/logger/logger.service.interface"
import { HealthcheckController } from "./healthcheck/healthcheck.controller"
import { IHealthcheckController } from "./healthcheck/healthcheck.controller.interface"

interface IBootstrapReturn {
  appContainer: Container
  app: App
}

const appBindings = new ContainerModule((bind: interfaces.Bind) => {
  bind<DatabaseService>(TYPES.DatabaseService).to(DatabaseService).inSingletonScope()
  bind<IExceptionFilter>(TYPES.IExceptionFilter).to(ExceptionFilter).inSingletonScope()
  bind<IPostsController>(TYPES.IPostsController).to(PostController).inSingletonScope()
  bind<IPostsRepository>(TYPES.IPostsRepository).to(PostsRepository).inSingletonScope()
  bind<IPostService>(TYPES.IPostService).to(PostsService).inSingletonScope()
  bind<IAuthService>(TYPES.IAuthService).to(AuthService).inSingletonScope()
  bind<IAuthController>(TYPES.IAuthController).to(AuthController).inSingletonScope()
  bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository).inSingletonScope()
  bind<IUserController>(TYPES.IUserController).to(UserController).inSingletonScope()
  bind<IUserService>(TYPES.IUserService).to(UserService).inSingletonScope()
  bind<IMailerService>(TYPES.IMailerService).to(MailerService).inSingletonScope()
  bind<IConfigService>(TYPES.IConfigService).to(ConfigService).inSingletonScope()
  bind<ITagRepository>(TYPES.ITagRepository).to(TagRepository).inSingletonScope()
  bind<ITagService>(TYPES.ITagService).to(TagService).inSingletonScope()
  bind<ITagController>(TYPES.ITagController).to(TagController).inSingletonScope()
  bind<ICommentController>(TYPES.ICommentController).to(CommentController).inSingletonScope()
  bind<ICommentService>(TYPES.ICommentService).to(CommentService).inSingletonScope()
  bind<ICommentRepository>(TYPES.ICommentRepository).to(CommentRepository).inSingletonScope()
  bind<ILoggerService>(TYPES.ILoggerService).to(LoggerService).inSingletonScope()
  bind<IHealthcheckController>(TYPES.IHealthcheckController).to(HealthcheckController).inSingletonScope()
  bind<App>(TYPES.Application).to(App).inSingletonScope()
})

async function bootstrap(): Promise<IBootstrapReturn> {
  const appContainer = new Container()
  appContainer.load(appBindings)
  const app = appContainer.get<App>(TYPES.Application)
  await app.init()
  return { appContainer, app }
}

export const boot = bootstrap()
