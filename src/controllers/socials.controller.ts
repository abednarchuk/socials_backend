import { User } from '../models/user.model'
import { Request, Response, NextFunction } from 'express'
import { catchAsync } from '../utils/catchAsync'

import { IUserRequest } from '../types_interfaces/user.request'
import { AppError } from '../utils/AppError'

export const getSocials = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const username = req.params.username
  const user = await User.findOne({ username }).select(['socials'])

  if (!user) {
    return next(new AppError(`User with username: "${username}" does not exist`, 404))
  }

  res.status(200).json({
    status: 'success',
    data: {
      socials: user.socials,
    },
  })
})

export const updateSocials = catchAsync(
  async (req: IUserRequest, res: Response, next: NextFunction) => {
    const { twitter, facebook, github, twitch } = req.body
    const currentUser = await User.findByIdAndUpdate(
      req.currentUser!._id,
      {
        socials: {
          twitter: twitter ? twitter : undefined,
          facebook: facebook ? facebook : undefined,
          github: github ? github : undefined,
          twitch: twitch ? twitch : undefined,
        },
      },
      { runValidators: true, new: true }
    )

    res.status(201).json({
      status: 'success',
      data: {
        socials: currentUser!.socials,
      },
    })
  }
)
