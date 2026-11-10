import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env.js'
import healthRoutes from './routes/health.routes.js'
import { ApiError, notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()

const corsOptions = {
  origin(origin, callback) {
    // Requests without an Origin header (curl, health monitors) are allowed.
    if (!origin || env.clientOrigins.includes(origin)) return callback(null, true)
    callback(new ApiError(403, `Origin not allowed by CORS: ${origin}`, 'CORS_BLOCKED'))
  },
}

app.use(helmet())
app.use(cors(corsOptions))
app.use(express.json({ limit: '100kb' }))

app.use('/api/health', healthRoutes)

app.use(notFound)
app.use(errorHandler)

app.listen(env.port, () => {
  console.log(`OWLYNX AI server running on http://localhost:${env.port} (${env.nodeEnv})`)
  console.log(`Allowed origins: ${env.clientOrigins.join(', ')}`)
})