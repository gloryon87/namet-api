import Production from "./schema.js"

class ProductionDataAccess {
  async getAllProductions () {
    return await Production.find()
  }

  async getProduction (name) {
    return await Production.find({ name: name })
  }

  async addNewProduction (body) {
    return await new Production(body).save()
  }

  async findProduction (body) {
    return await Production.find(body)
  }

  async updateProduction (id, body) {
    return await Production.updateOne({ _id: id }, body)
  }

  async deleteProduction (id) {
    return await Production.deleteOne({ _id: id })
  }

}

export default ProductionDataAccess
