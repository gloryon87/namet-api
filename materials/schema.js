import mongoose from 'mongoose'

const materialsSchema = new mongoose.Schema({
  color: String,
  qty: Number
}, {
  collection: 'materials'
}
)

const Material = mongoose.model('Materials', materialsSchema)

export default Material
