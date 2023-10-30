import Good from "./schema.js"

class GoodsDataAccess {
  async getAllGoods () {
    return await Good.find()
  }

  async addNewGood (body) {
    return await new Good(body).save()
  }

  async findGood (body) {
    return await Good.find(body)
  }

  async updateGood (id, body) {
    return await Good.updateOne({ _id: id }, body)
  }

  async deleteGood (id) {
    return await Good.deleteOne({ _id: id })
  }

}

export default GoodsDataAccess
