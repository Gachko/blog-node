import { Container, ContainerModule, inject, injectable, interfaces } from "inversify"
import "reflect-metadata"
import { ILoggerService } from "../src/common/logger/logger.service.interface"
import { TYPES } from "../src/common/constants/types"
import { DatabaseService } from "../src/common/database/database.service"
import { IAuthService } from "../src/auth/auth.service.interface"
import { userData } from "./data/user"
import { LoggerService } from "../src/common/logger/logger.service"
import { AuthService } from "../src/auth/auth.service"
import { IConfigService } from "../src/common/config/config.service.interface"
import { ConfigService } from "../src/common/config/config.service"
import { IUserRepository } from "../src/user/user.repository.interface"
import { UserRepository } from "../src/user/user.repository"
import { IUserService } from "../src/user/user.service.interface"
import { UserService } from "../src/user/user.service"
import { IMailerService } from "../src/mailer/mailer.service.interface"
import { MailerService } from "../src/mailer/mailer.service"

@injectable()
export class Seed {
  constructor(
    @inject(TYPES.ILoggerService) private loggerService: ILoggerService,
    @inject(TYPES.DatabaseService) private databaseService: DatabaseService,
    @inject(TYPES.IAuthService) private authService: IAuthService,
  ) {}

  async uploadData() {
    this.loggerService.log(`Start seeding ...`)
    for (const user of userData) {
      try {
        const hashedPassword = await this.authService.generatePassword(user.password)
        const newUser = await this.databaseService.client.user.create({
          data: { ...user, password: hashedPassword },
        })
        this.loggerService.log(`Created user with id: ${newUser.id}`)
      } catch (e) {
        this.loggerService.log(`User is already exists`)
      }
    }

    this.loggerService.log(`Seeding finished.`)
  }

  async init(): Promise<void> {
    await this.uploadData()
    await this.databaseService.disconnect()
  }
}

export const seedBinging = new ContainerModule((bind: interfaces.Bind) => {
  bind<ILoggerService>(TYPES.ILoggerService).to(LoggerService).inSingletonScope()
  bind<IAuthService>(TYPES.IAuthService).to(AuthService).inSingletonScope()
  bind<DatabaseService>(TYPES.DatabaseService).to(DatabaseService).inSingletonScope()
  bind<IUserService>(TYPES.IUserService).to(UserService).inSingletonScope()
  bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository).inSingletonScope()
  bind<IConfigService>(TYPES.IConfigService).to(ConfigService).inSingletonScope()
  bind<IMailerService>(TYPES.IMailerService).to(MailerService).inSingletonScope()
  bind<Seed>(TYPES.ISeed).to(Seed)
})

const seedContainer = new Container()
seedContainer.load(seedBinging)
const seed = seedContainer.get<Seed>(TYPES.ISeed)
seed.init()
