import Material from './schema.js';

class MaterialsDataAccess {
  async getAllMaterials () {
    return await Material.find()
  }

  async addNewMaterial(material) {
  try {
    const existingMaterial = await Material.findOne({
      color: material.color,
      material: material.material
    });

    if (existingMaterial) {
      // Матеріал існує, оновлюємо його qty
      existingMaterial.qty += +material.qty;
      await existingMaterial.save();
      return existingMaterial;
    } else {
      // Матеріал не існує, додаємо новий
      const newMaterial = new Material(material);
      await newMaterial.save();
      return newMaterial;
    }
  } catch (error) {
    throw error;
  }
}

  async findMaterial (body) {
    return await Material.find(body)
  }

  async updateMaterial (id, body) {
    return await Material.updateOne({ _id: id }, body)
  }

  async updateMaterials(ids, updatedMaterials) {
  const bulkOperations = ids.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: updatedMaterials[index] },
    },
  }));

  return await Material.bulkWrite(bulkOperations);
}

  async deleteMaterial (id) {
    return await Material.deleteOne({ _id: id })
  }

}

export default MaterialsDataAccess
