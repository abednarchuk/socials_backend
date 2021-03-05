import { Request } from 'express'
import { ICurrentUser } from './ICurrentUser'

export interface IUserRequest extends Request {
  currentUser?: ICurrentUser
}
