import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import 'dotenv/config'
import OrdersDataAccess from './orders/DataAccess.js'
import MaterialsDataAccess from './materials/DataAccess.js';
import GoodsDataAccess from './goods/DataAccess.js';

// server

const app = express()
const PORT = 4000

app.use(cors())
app.use(express.json())

const main = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://gloryon87:${process.env.PASSWORD}@cluster0.znu7elp.mongodb.net/Namet?retryWrites=true&w=majority`
    )
    console.log('Connected to MongoDB')

    app.listen(PORT, err => {
      if (err) {
        console.error(err)
        if (err.code === 'EADDRINUSE') {
          console.error(`Порт ${PORT} вже зайнятий.`)
        }
        process.exit(1)
      }
      console.log(`Server is running on port http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

main()

// ЗАМОВЛЕННЯ
const ordersData = new OrdersDataAccess

// GET: Отримати всі замовлення
app.get('/api/orders', async (req, res) => {
  try {
    const allOrders = await ordersData.getAllOrders()
    res.json(allOrders)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// GET: Отримати одне замовлення
app.get('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id
    const order = await ordersData.getOrder(orderId)
    res.json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// GET: Пошук за параметрами
app.get('/api/orders', async (req, res) => {
  try {
    const searchParams = req.query // Отримання параметрів запиту з URL

    // Виклик методу для пошуку замовлень за параметрами
    const foundOrders = await ordersData.findOrdersByParams(searchParams)

    res.json(foundOrders)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})
// /api/orders?contacts=0989880990 Слава&state=в роботі

// POST: Додати нове замовлення
app.post('/api/orders', async (req, res) => {
  try {
    const newOrderData = req.body

// Calculate and add new fields to each goods item
const goodsWithId = newOrderData.goods.map(goodsItem => {
  const goodArea = goodsItem.a * goodsItem.b * goodsItem.qty

  // Calculate the sum of qty in the color array
  const colorQtySum = goodsItem.color.reduce((sum, color) => sum + color.qty, 0)

  // Calculate divider and colorArea for each color
  const colorWithCalculation = goodsItem.color.map(color => {
    const divider = colorQtySum
    const colorArea = (goodArea * color.qty) / divider

    return {
      ...color,
      divider,
      colorArea
    }
  })

  return {
    ...goodsItem,
    _id: new mongoose.Types.ObjectId(),
    goodArea,
    color: colorWithCalculation
  }
})

// Create a new order with updated goods
const newOrder = {
  ...newOrderData,
  goods: goodsWithId
}

const addedOrder = await ordersData.addNewOrder(newOrder)
res.json(addedOrder)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// PUT: Оновити існуюче замовлення
app.put('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id
    const updatedData = req.body // Отримайте дані для оновлення з запиту
    const updatedOrder = await ordersData.updateOrder(orderId, updatedData)
    res.json(updatedOrder)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// DELETE: Видалити замовлення
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id
    const deletionResult = await ordersData.deleteOrder(orderId)
    res.json(deletionResult)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// Залишки матеріалів

const materialsData = new MaterialsDataAccess()

// GET: Отримати всі матеріали
app.get('/api/materials', async (req, res) => {
  try {
    const allMaterials = await materialsData.getAllMaterials()
    res.json(allMaterials)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// POST: Додати новий матеріал
app.post('/api/materials', async (req, res) => {
  try {
    const newMaterial = req.body
    const addedMaterial = await materialsData.addNewMaterial(newMaterial)
    res.json(addedMaterial)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// PUT: Оновити існуючий матеріал
app.put('/api/materials/:id', async (req, res) => {
  try {
    const materialId = req.params.id
    const updatedData = req.body
    const updatedMaterial = await materialsData.updateMaterial(
      materialId,
      updatedData
    )
    res.json(updatedMaterial)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// DELETE: Видалити матеріал
app.delete('/api/materials/:id', async (req, res) => {
  try {
    const materialId = req.params.id;
    const deletionResult = await materialsData.deleteMaterial(materialId);
    res.json(deletionResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// GET: Пошук матеріалів за параметрами
app.get('/api/materials/search', async (req, res) => {
  try {
    const searchParams = req.query; // Отримайте параметри пошуку з запиту
    const foundMaterials = await materialsData.findMaterial(searchParams);
    res.json(foundMaterials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});


// Товари на складі

const goodsData = new GoodsDataAccess()

// GET: Отримати всі товари
app.get('/api/goods', async (req, res) => {
  try {
    const allGoods = await goodsData.getAllGoods()
    res.json(allGoods)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// POST: Додати новий товар
app.post('/api/goods', async (req, res) => {
  try {
    const newGood = req.body
    const addedGood = await goodsData.addNewGood(newGood)
    res.json(addedGood)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// PUT: Оновити існуючий товар
app.put('/api/goods/:id', async (req, res) => {
  try {
    const goodId = req.params.id
    const updatedData = req.body
    const updatedGood = await goodsData.updateGood(goodId, updatedData)
    res.json(updatedGood)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// DELETE: Видалити товар
app.delete('/api/goods/:id', async (req, res) => {
  try {
    const goodId = req.params.id
    const deletionResult = await goodsData.deleteGood(goodId)
    res.json(deletionResult)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// GET: Пошук товарів за параметрами
app.get('/api/goods/search', async (req, res) => {
  try {
    const searchParams = req.query // Отримайте параметри пошуку з запиту
    const foundGoods = await goodsData.findGood(searchParams)
    res.json(foundGoods)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})
