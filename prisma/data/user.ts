import { Prisma, Role, Status } from "@prisma/client"

export const userData: Prisma.UserCreateInput[] = [
  {
    name: "Admin",
    email: "admin@admin.com",
    password: "11111111",
    role: Role.ADMIN,
    status: Status.ACTIVE,
    posts: {
      create: {
        title: "post Title",
        text: "some text",
        viewsCount: 1,
        isPublish: true,
        tags: {
          create: {
            title: "animal",
          },
        },
      },
    },
  },
  {
    name: "User2",
    email: "user2@user.com",
    password: "11111111",
    role: Role.USER,
    status: Status.ACTIVE,
    posts: {
      create: {
        title: "post Title3",
        text: "some text3",
        viewsCount: 1,
        isPublish: false,
        tags: {
          create: {
            title: "art",
          },
        },
      },
    },
  },
  {
    name: "user1",
    email: "user1@user.com",
    password: "11111111",
    role: Role.USER,
    status: Status.INACTIVE,
  },
  {
    name: "Manager",
    email: "manager@manager.com",
    password: "11111111",
    role: Role.MANAGER,
    status: Status.ACTIVE,
    posts: {
      create: {
        title: "post Title2",
        text: "some text2",
        viewsCount: 1,
        isPublish: true,
        tags: {
          create: {
            title: "flowers",
          },
        },
      },
    },
  },
]
