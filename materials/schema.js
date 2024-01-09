import mongoose from 'mongoose'

const materialsSchema = new mongoose.Schema({
  _id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId()
        },
  color: String,
  material: String,
  qty: Number
}, {
  collection: 'materials'
}
)

const Material = mongoose.model('Materials', materialsSchema)

export default Material