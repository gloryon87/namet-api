import Order from './schema.js'


class OrdersDataAccess {
  async getAllOrders() {
    return Order.find()
  }

  async getOrder (id) {
    return await Order.find({ _id: id })
  }

  async addNewOrder (body) {
    return await new Order(body).save()
  }
  
  async findOrder (body) {
    return await Order.find(body)
  }

  async updateOrder (id, body) {
    return await Order.updateOne({ _id: id }, body)
  }

  async removeGoodFromOrder(orderId, goodIdToRemove) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Замовлення не знайдено');
      }
      order.goods.pull({ _id: goodIdToRemove });
      await order.save();

      return order;
    } catch (error) {
      throw error;
    }
  }

  async addGoodToOrder(orderId, newGoodData) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Замовлення не знайдено');
      }
      order.goods.push(newGoodData);
      await order.save();

      return order;
    } catch (error) {
      throw error;
    }
  }

  async updateGoodInOrder(orderId, goodId, updatedGoodData) {
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Замовлення не знайдено');
    }

    const goodToUpdate = order.goods.id(goodId);
    console.log(goodId)

    // Перевірити, чи товар знайдено
    if (!goodToUpdate) {
      throw new Error('Товар не знайдено в замовленні');
    }

    // Оновити властивості товару
    goodToUpdate.set(updatedGoodData);

    // Зберегти зміни
    await order.save();

    return order;
  } catch (error) {
    throw error;
  }
}

  async deleteOrder (id) {
    return await Order.deleteOne({ _id: id })
  }
}

export default OrdersDataAccess
