import mongoose from 'mongoose'

const productionSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    contacts: String,
    goods: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        a: Number,
        b: Number,
        qty: Number,
        delivered: Number,
        season: String,
        material: String,
        state: String,
        color: [
          {
            name: String,
            qty: Number,
            divider: Number,
            colorArea: Number
          }
        ],
        goodArea: Number,
        date: Date
      }
    ],
    materials: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        color: String,
        material: String,
        qty: Number
      }
    ]
  },
  {
    collection: 'production'
  }
)

const Production = mongoose.model('production', productionSchema)

export default Production
