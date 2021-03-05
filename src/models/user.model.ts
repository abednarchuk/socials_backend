import { model, Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'
import validator from 'validator'

export interface IUser extends Document {
  name: string
  username: string
  email: string
  password: string
  socials: {
    twitter: string | undefined
    facebook: string | undefined
    github: string | undefined
    twitch: string | undefined
  }
}

interface IUserDoc extends IUser {
  comparePasswords(candidatePassword: string, userPassword: string): boolean
}

const validateUsername = [
  {
    validator: function (v: string) {
      return /^(?![_.])/.test(v)
    },
    message: 'No . or _ at the beginning',
  },
  {
    validator: function (v: string) {
      return /^(?!.*[_.]{2})/.test(v)
    },
    message: 'No __ or _. or ._ or .. inside',
  },
  {
    validator: function (v: string) {
      return /^[a-zA-Z0-9._]/.test(v)
    },
    message: 'Only letters, numbers, . and _ allowed',
  },
  {
    validator: function (v: string) {
      return /(?<![_.])$/.test(v)
    },
    message: 'No . or _ at the end',
  },
]

const validatePassword = [
  {
    validator: function (v: string) {
      return /^(?=.*[0-9])/.test(v)
    },
    message: 'Password must contain at least 1 number',
  },
  {
    validator: function (v: string) {
      return /^(?=.*[a-z])/.test(v)
    },
    message: 'Password must contain at least 1 lowercase letter',
  },
  {
    validator: function (v: string) {
      return /^(?=.*[A-Z])/.test(v)
    },
    message: 'Password must contain at least 1 uppercase letter',
  },
  {
    validator: function (v: string) {
      return /(?=.*[.,!@#$%^&+=*()\[\]{}<;~"':>_-])/.test(v)
    },
    message: 'Password must contain at least 1 special character: .,!@#$%^&+=*()[]{}<;~"\':>_-',
  },
]

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    maxlength: [49, 'Name must be shorter than 50 characters'],
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    lowercase: true,
    minlength: [5, 'Username must be longer than 4 characters'],
    maxlength: [29, 'Username must be shorter than 30 characters'],
    unique: [true, 'Username must be unique'],
    validate: validateUsername,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: [true, 'Email must be unique'],
    validate: [validator.isEmail, 'Please provide a valid email'],
    lowercase: true,
  },
  socials: {
    twitter: {
      type: String,
      validate: validateUsername,
    },
    facebook: {
      type: String,
      validate: validateUsername,
    },
    github: {
      type: String,
      validate: validateUsername,
    },
    twitch: {
      type: String,
      validate: validateUsername,
    },
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be longer than 8 characters'],
    maxlength: [25, 'Password must be shorter than 25 characters'],
    select: false,
    validate: validatePassword,
  },
})

UserSchema.pre('save', async function (this: IUser, next) {
  // Only run if password was modified
  if (!this.isModified('password')) return next()
  // Hash password
  this.password = await bcrypt.hash(this.password, 12)

  next()
})

UserSchema.methods.comparePasswords = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

export const User = model<IUserDoc>('User', UserSchema)
