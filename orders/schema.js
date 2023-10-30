import mongoose from 'mongoose'

const ordersSchema = new mongoose.Schema({
   contacts: String,
  goods: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      a: Number,
      b: Number,
      qty: Number,
      season: String,
      material: String,
      color: {
        baige10: Number,
        olive: Number,
        brown: Number,
      },
      production: String,
    },
  ],
  date: Date,
  info: String,
  state: String,
  priority: Boolean,
  deadline: Date,
}, {
  collection: 'orders'
}
)

const Order = mongoose.model('Orders', ordersSchema)

export default Order
