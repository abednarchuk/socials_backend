declare namespace Express {
  export interface Request {
    currentUser?: {
      _id: string
    }
  }
}
