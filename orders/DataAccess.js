import Order from './schema.js'

class OrdersDataAccess {
  async getAllOrders () {
    return await Order.find()
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

  async deleteOrder (id) {
    return await Order.deleteOne({ _id: id })
  }
}

export default OrdersDataAccess
