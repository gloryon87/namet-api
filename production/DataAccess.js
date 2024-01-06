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

    async addGoodToProduction(productionId, newGoodData) {
    try {
      const production = await Production.findById(productionId);
      if (!production) {
        throw new Error('Виробництво не знайдено');
      }
      production.goods.push(newGoodData);
      await production.save();

      return production;
    } catch (error) {
      throw error;
    }
  }

  async updateGoodInProduction(productionId, goodId, updatedGoodData) {
  try {
    const production = await Production.findById(productionId);

    if (!production) {
      throw new Error('Виробництво не знайдено');
    }

    const goodToUpdate = production.goods.id(goodId);

    // Перевірити, чи товар знайдено
    if (!goodToUpdate) {
      throw new Error('Товар не знайдено в замовленні');
    }

    // Оновити властивості товару
    goodToUpdate.set(updatedGoodData);

    // Зберегти зміни
    await production.save();

    return production;
  } catch (error) {
    throw error;
  }
}

  async deleteProduction (id) {
    return await Production.deleteOne({ _id: id })
  }

}

export default ProductionDataAccess
