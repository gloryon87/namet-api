import Material from './schema.js';

class MaterialsDataAccess {
  async getAllMaterials () {
    return await Material.find()
  }

  async addNewMaterial (body) {
    return await new Material(body).save()
  }

  async findMaterial (body) {
    return await Material.find(body)
  }

  async updateMaterial (id, body) {
    return await Material.updateOne({ _id: id }, body)
  }

  async deleteMaterial (id) {
    return await Material.deleteOne({ _id: id })
  }

}

export default MaterialsDataAccess
