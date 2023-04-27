export const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    components: {},
    info: {
      title: "API",
      version: "1.0.0",
    },
  },
  apis: ["**/*.controller.ts"],
}
