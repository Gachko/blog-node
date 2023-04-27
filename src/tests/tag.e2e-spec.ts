import { App } from "../app"
import { boot } from "../index"
import request from "supertest"

let application: App

beforeAll(async () => {
  const { app } = await boot
  application = app
})

describe("Tag e2e", () => {
  it("Add tag(without auth) - error", async () => {
    const res = await request(application.app).post("/api/v1/tag").send({ title: "art1" })
    expect(res.statusCode).toBe(403)
  })
  it("Add tag(as ADMIN) - error", async () => {
    const resToken = await request(application.app)
      .post("/api/v1/auth/login")
      .send({ email: "kgachko@gmail.com", password: "string" })
    const res = await request(application.app)
      .post("/api/v1/tag")
      .set("x-access-token", resToken.body.jwt)
      .send({ title: "art" })
    expect(res.statusCode).toBe(409)
  })
  it("get tag by id - error", async () => {
    const resToken = await request(application.app)
      .post("/api/v1/auth/login")
      .send({ email: "kgachko@gmail.com", password: "string" })
    const res = await request(application.app).get(`/api/v1/tag/123`).set("x-access-token", resToken.body.jwt)
    expect(res.statusCode).toBe(404)
  })
  it("get tag by id-success", async () => {
    const expectedTag = {
      id: "clfiksnko0002ljwgqldsbzfj",
      title: "tag",
      createdAt: "2023-03-21T18:15:01.464Z",
      updatedAt: "2023-03-21T18:15:01.464Z",
    }
    const resToken = await request(application.app)
      .post("/api/v1/auth/login")
      .send({ email: "kgachko@gmail.com", password: "string" })
    const res = await request(application.app)
      .get(`/api/v1/tag/clfiksnko0002ljwgqldsbzfj`)
      .set("x-access-token", resToken.body.jwt)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(expectedTag)
  })
  it("Delete tag(without auth) - error", async () => {
    const res = await request(application.app).delete("/api/v1/tag/clfiksq7r0004ljwgmwwpkon7")
    expect(res.statusCode).toBe(403)
  })
  it("Delete tag(without auth) - ADMIN", async () => {
    const resToken = await request(application.app)
      .post("/api/v1/auth/login")
      .send({ email: "kgachko@gmail.com", password: "string" })
    const res = await request(application.app)
      .delete("/api/v1/tag/clfiksq7r0004ljwgmwwpkon7")
      .set("x-access-token", resToken.body.jwt)
    expect(res.statusCode).toBe(200)
  })
})

afterAll( async () => {
    await application.close()
})
