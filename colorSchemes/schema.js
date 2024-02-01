import mongoose from 'mongoose'

const colorSchemesSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    schemeName: String,
    colors: [{ name: String, qty: Number }]
  },
  {
    collection: 'colorSchemes'
  }
)

const ColorSchemes = mongoose.model('ColorSchemes', colorSchemesSchema)

export default ColorSchemes

