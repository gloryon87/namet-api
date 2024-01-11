import mongoose from 'mongoose'

const goodsSchema = new mongoose.Schema({
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId()
        },
        a: Number,
        b: Number,
        qty: Number,
        season: String,
        material: String,
        colorCode: String,
        deliveries: [{date: String, orderId: String, qty: Number, orderContacts: String }],
        color: [
          {
            name: String,
            qty: Number,
          }
        ],
        goodArea: Number
      }
, {
  collection: 'goods'
}
)

const Good = mongoose.model('Goods', goodsSchema)

export default Good
