import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./packages/infrastructure/shared/src/database/schema/*",
  out: "./packages/infrastructure/shared/src/database/migrations",
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "mysecretpassword",
    database: process.env.DB_NAME || "honocom",
  },
  verbose: true,
  strict: true,
});
