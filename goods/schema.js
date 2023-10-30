import mongoose from 'mongoose'

const goodsSchema = new mongoose.Schema({
      a: Number,
      b: Number,
      qty: Number,
      season: String,
      material: String,
      color: {
        baige10: Number,
        olive: Number,
        brown: Number
      }
    }
, {
  collection: 'goods'
}
)

const Good = mongoose.model('Goods', goodsSchema)

export default Good
