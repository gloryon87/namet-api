import mongoose from 'mongoose'

const colorsSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    name: String
  },
  {
    collection: 'colors'
  }
)

const Colors = mongoose.model('Colors', colorsSchema)

export default Colors

