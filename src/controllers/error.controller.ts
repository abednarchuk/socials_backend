import { AppError } from '../utils/AppError'
import { Request, Response, NextFunction } from 'express'

const sendErrorDev = (error: AppError, res: Response) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stack: error.stack,
    error: error,
  })
}

const sendErrorProd = (error: AppError, res: Response) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    })
  } else {
    console.error('ERROR OCCURED', error)
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    })
  }
}

export default (error: AppError, req: Request, res: Response, next: NextFunction) => {
  error.statusCode = error.statusCode || 500
  error.status = error.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res)
  } else if (process.env.NODE_ENV === 'production') {
    let err = Object.assign(error)
    // MONGODB errors
    if (err.name === 'CastError') err = handleCastErrorDB(err)
    if (err.code === 11000) err = handleDuplicateFieldsDB(err)
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err)
    // JWT errors
    if (err.name === 'JsonWebTokenError') err = handleJWTError()
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError()

    sendErrorProd(err, res)
  }
}

const handleValidationErrorDB = (err: AppError) => {
  const errors = Object.values(err.errors).map((el: any) => el.message)
  const message = `Invalid input data. ${errors.join('. ')}`

  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err: AppError) => {
  const key = Object.keys(err.keyValue)[0]
  const value = Object.values(err.keyValue)[0]
  const message = `Duplicate ${key}: ${value}. Please use another ${key}.`

  return new AppError(message, 400)
}
const handleCastErrorDB = (err: AppError) => {
  const message = `Invalid ${err.path}:${err.value}.`

  return new AppError(message, 400)
}

const handleJWTError = () => new AppError('You need to be logged in. Token not found', 401)

const handleJWTExpiredError = () => new AppError('Token expired. Please log in again', 401)
