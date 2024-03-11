import mongoose from 'mongoose'

const ordersSchema = new mongoose.Schema(
  {
    contacts: String,
    goods: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId()
        },
        a: Number,
        b: Number,
        qty: Number,
        delivered: Number,
        season: String,
        material: String,
        code: String,
        color: [
          {
            name: String,
            qty: Number,
            divider: Number,
            colorArea: Number
          }
        ],
        goodArea: Number,
        production: String
      }
    ],
    date: Date,
    info: String,
    state: String,
    priority: String,
    deadline: Date,
    comment: String
  },
  {
    collection: 'orders'
  }
)


const Order = mongoose.model('Orders', ordersSchema)

export default Order
