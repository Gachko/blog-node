import "reflect-metadata"
import { Container } from "inversify"
import { TYPES } from "../../common/constants/types"
import { Role, Status, User } from "@prisma/client"
import { IUserRepository } from "../user.repository.interface"
import { IUserService } from "../user.service.interface"
import { UserService } from "../user.service"

const UserRepositoryMock: IUserRepository = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findByIdOrThrow: jest.fn(),
  updateStatus: jest.fn(),
  updatePassword: jest.fn(),
  getAll: jest.fn(),
  update: jest.fn(),
}

const container = new Container()
let userRepository: IUserRepository
let userService: IUserService

beforeAll(() => {
  container.bind<IUserRepository>(TYPES.IUserRepository).toConstantValue(UserRepositoryMock)
  container.bind<IUserService>(TYPES.IUserService).to(UserService)
  userRepository = container.get<IUserRepository>(TYPES.IUserRepository)
  userService = container.get<IUserService>(TYPES.IUserService)
})

let createdUser: User | null

const testUser = [
  {
    id: "1",
    name: "user.name",
    email: "user1@email.ru",
    createdAt: "2023-03-21 18:14:51.317",
    status: Status.ACTIVE,
    role: Role.MANAGER,
  },
  {
    id: "2",
    name: "user.name",
    email: "user2@email.ru",
    createdAt: "2023-03-21 18:14:51.317",
    status: Status.ACTIVE,
    role: Role.MANAGER,
  },
]

describe("User service", () => {
  it("create User", async () => {
    userRepository.create = jest.fn().mockImplementationOnce((user) => ({
      id: "1",
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      status: user.status,
      role: user.role,
    }))
    createdUser = await userService.createUser({
      name: "User",
      email: "test@mail.ru",
      password: "12345",
      status: Status.INACTIVE,
      role: Role.USER,
      createdAt: new Date("2023-03-21 18:14:51.317"),
      updatedAt: new Date("2023-03-21 18:14:51.317"),
    })

    expect(createdUser).not.toBeNull()
    expect(createdUser?.email).toEqual("test@mail.ru")
    expect(createdUser?.id).toEqual("1")
    expect(createdUser?.password).toEqual("12345")
  })
  it("find user by email", async () => {
    userRepository.findByEmail = jest.fn().mockReturnValue(createdUser)
    const user = await userService.findUserByEmail("test@mail.ru")
    expect(user).toEqual(createdUser)
  })
  it("find users", async () => {
    userRepository.getAll = jest.fn().mockReturnValue(testUser)
    const users = await userService.findUsers()
    expect(users).toEqual(testUser)
  })
  it("find current user", async () => {
    userRepository.findByIdOrThrow = jest.fn().mockReturnValue(createdUser)
    const user = await userService.findMe("1")
    const expectedUser = { ...createdUser }
    delete expectedUser.password
    delete expectedUser.updatedAt
    expect(user).toEqual(expectedUser)
  })
  it("edit User", async () => {
    userRepository.update = jest.fn().mockImplementationOnce((user) => ({
      ...createdUser,
      status: user.status,
      role: user.role,
    }))

    const editedUser = await userService.editUser(
      {
        status: Status.INACTIVE,
        role: Role.ADMIN,
      },
      "1",
    )
    expect(editedUser?.status).toEqual(Status.INACTIVE)
    expect(editedUser?.role).toEqual(Role.ADMIN)
  })
})
