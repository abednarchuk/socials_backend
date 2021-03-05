import { app } from './index'
import mongoose from 'mongoose'
import { config } from 'dotenv'
// load env variables
config()

const DB = process.env.MONGODB_URL!.replace('<password>', process.env.MONGODB_PASSWORD!)

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('DB connection successful!')
  })

const port = process.env.PORT!
app.listen(port, () => {
  console.log(`Listening on port ${port}!`)
})
