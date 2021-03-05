export class AppError extends Error {
  status: 'success' | 'fail' | 'error'
  isOperational: boolean

  errors?: any
  code?: any
  keyValue?: any
  path?: any
  value?: any

  constructor(public message: string, public statusCode: number) {
    super(message)

    this.statusCode = statusCode
    this.isOperational = true

    if (`${statusCode}`.startsWith('2')) {
      this.status = 'success'
    } else if (`${statusCode}`.startsWith('4')) {
      this.status = 'fail'
    } else {
      this.status = 'error'
    }

    Error.captureStackTrace(this, this.constructor)
  }
}
