import mongoose from 'mongoose'

const goodsSchema = new mongoose.Schema({
        _id: mongoose.Schema.Types.ObjectId,
        a: Number,
        b: Number,
        qty: Number,
        season: String,
        material: String,
        deliveries: [{date: String, orderId: String, qty: Number}],
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
