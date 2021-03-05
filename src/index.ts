import globalErrorHandler from './controllers/error.controller'
import { AppError } from './utils/AppError'
// Global middlewares import
import express from 'express'
import cors, { CorsOptions } from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
// Routers import
import authRouter from './routes/auth.routes'
import socialsRouter from './routes/socials.routes'

export const app = express()

const options: CorsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
}

// GLOBAL MIDDLEWARES
app.use(express.json())
app.use(morgan('dev'))
app.use(cors(options))
app.use(cookieParser())
// Routers
app.use('/', authRouter)
app.use('/socials', socialsRouter)
// Non existing endpoints handler
app.all('*', (req, res, next) => {
  const err = new AppError(`${req.originalUrl} endpoint does not exist!`, 404)
  next(err)
})

app.use(globalErrorHandler)
