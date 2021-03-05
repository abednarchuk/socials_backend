import { Request, Response, NextFunction, RequestHandler } from 'express'
import { AppError } from '../utils/AppError'
import { User } from '../models/user.model'

import { catchAsync } from '../utils/catchAsync'
import jwt from 'jsonwebtoken'

import { ICurrentUser } from '../types_interfaces/ICurrentUser'
import { IUserRequest } from '../types_interfaces/user.request'

export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, username, email, password } = req.body
  const newUser = await User.create({
    name,
    username,
    email,
    password,
  })

  const currentUser: ICurrentUser = {
    _id: newUser._id,
    name: newUser.name,
    username: newUser.username,
    email: newUser.email,
  }

  createSendToken(currentUser, 201, res)
})

export const getMe = (req, res, next) => {
  const user = req.currentUser!
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    },
  })
}

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body
  // 1) Check if email & password exist
  if (!username || !password) {
    throw new AppError('Please provide username and password', 400)
  }
  // 2) Check if user exist and compare password
  const user = await User.findOne({ username }).select('+password')
  if (!user || !(await user.comparePasswords(password, user.password))) {
    throw new AppError('Incorrect email or password', 401)
  }
  // 3) If everything ok, send token
  const currentUser: ICurrentUser = {
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
  }
  createSendToken(currentUser, 200, res)
})

export const logout: RequestHandler = (req, res, next) => {
  const cookieOptions = {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: false,
  }
  res.cookie('jwt', '', cookieOptions)
  res.status(200).json({
    status: 'success',
  })
}

export const protect = catchAsync(async (req: IUserRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt
  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access', 401))
  }

  // 2) Verify token
  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
  if (!decoded) {
    return next(new AppError('Your token is invalid or expired', 401))
  }
  // 3) Check if user still exists
  const user = await User.findById(decoded.id)
  if (!user) {
    return next(new AppError('The user belonging to this token does no longer exist', 401))
  }
  req.currentUser = {
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
  }
  next()
})

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN + 'd',
  })
}

const createSendToken = (user: ICurrentUser, statusCode: number, res: Response) => {
  const token = signToken(user._id)
  const cookieOptions = {
    expires: new Date(Date.now() + +process.env.JWT_EXPIRES_IN! * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: false,
  }

  // if (process.env.NODE_ENV! === 'production') cookieOptions.secure = true

  res.cookie('jwt', token, cookieOptions)

  res.status(statusCode).json({
    status: 'success',
    data: {
      user,
    },
  })
}
