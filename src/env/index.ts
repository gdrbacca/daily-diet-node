import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  // NODE_ENV: z.enum(['production', 'development', 'test']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
})

export const _env = schema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment variables!', _env.error.format())

  throw new Error('Invalid environment variables')
}

export const env = _env.data
