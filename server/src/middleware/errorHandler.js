import multer from 'multer'
import { ZodError } from 'zod'
import { env } from '../config/env.js'

export class ApiError extends Error {
  constructor(status, message, code = 'ERROR') {
    super(message)
    this.status = status
    this.code = code
  }
}

export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND'))
}

// Express recognises an error handler by its 4 parameters, so keep `next`.
export function errorHandler(err, req, res, next) {
  let status = 500
  let code = 'INTERNAL_ERROR'
  let message = 'Something went wrong on the server.'
  let details

  if (err instanceof ApiError) {
    status = err.status
    code = err.code
    message = err.message
  } else if (err instanceof ZodError) {
    status = 400
    code = 'VALIDATION_ERROR'
    message = 'Invalid request.'
    details = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }))
  } else if (err instanceof multer.MulterError) {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400
    code = err.code
    message =
      err.code === 'LIMIT_FILE_SIZE' ? 'Audio file is too large.' : err.message
  } else if (err.type === 'entity.parse.failed') {
    status = 400
    code = 'INVALID_JSON'
    message = 'Request body is not valid JSON.'
  }

  if (status >= 500) console.error(err)

  res.status(status).json({
    error: {
      code,
      message,
      ...(details && { details }),
      ...(!env.isProduction && status >= 500 && { debug: err.message }),
    },
  })
}