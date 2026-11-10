import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config({ quiet: true })

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_ORIGINS: z.string().default('http://localhost:5173'),
  MAX_AUDIO_SIZE_MB: z.coerce.number().positive().default(10),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:')
  parsed.error.issues.forEach((issue) => {
    console.error(`- ${issue.path.join('.')}: ${issue.message}`)
  })
  process.exit(1)
}

const raw = parsed.data

export const env = {
  nodeEnv: raw.NODE_ENV,
  isProduction: raw.NODE_ENV === 'production',
  port: raw.PORT,
  clientOrigins: raw.CLIENT_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  maxAudioBytes: raw.MAX_AUDIO_SIZE_MB * 1024 * 1024,
}