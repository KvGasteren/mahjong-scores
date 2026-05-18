import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

config({ path: '.env.local', override: true })

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/mirgrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
})