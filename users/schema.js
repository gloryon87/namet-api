import mongoose from 'mongoose'

const usersSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },
  {
    collection: 'users'
  }
)


const User = mongoose.model('Users', usersSchema)

export default User
