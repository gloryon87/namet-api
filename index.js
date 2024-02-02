import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import 'dotenv/config'
import OrdersDataAccess from './orders/DataAccess.js'
import MaterialsDataAccess from './materials/DataAccess.js'
import GoodsDataAccess from './goods/DataAccess.js'
import ProductionDataAccess from './production/DataAccess.js'
import UsersDataAccess from './users/DataAccess.js'
import escapeStringRegexp from 'escape-string-regexp'
import jwt from 'jsonwebtoken'
import ColorsDataAccess from './colors/DataAccess.js'
import ColorSchemesDataAccess from './colorSchemes/DataAccess.js'
const { sign, verify } = jwt


// server

const app = express()
const PORT = 3000

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
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

main()

// Login
const usersData = new UsersDataAccess()

// POST: Логін
app.post('/api/login', async (req, res) => {
  try {
    const { login, password } = req.body
    const user = await usersData.userCheck(login, password)
    const token = sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: '7d'
    })
    res.status(200).json({ token })
  } catch (error) {
    console.error(error)
    if (error.message === 'User not found') {
      return res.status(401).json({ message: 'Помилка аутентифікації' })
    }
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// Перевірка токена

function authenticateToken (req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' })
    }

    req.user = user
    next()
  })
}

// GET: Перевірка токена
app.get('/api/check-token', authenticateToken, (req, res) => {
  res.json({ message: 'Token is valid' })
})


// ЗАМОВЛЕННЯ
const ordersData = new OrdersDataAccess()

// GET: Отримати одне замовлення
app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id
    const order = await ordersData.getOrder(orderId)
    res.json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// GET: Отримати всі замовлення або Пошук за параметрами
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const searchParams = req.query

    // Decode URL-encoded components
    for (const key in searchParams) {
      searchParams[key] = decodeURIComponent(searchParams[key])
    }

    let resultOrders

    if (Object.keys(searchParams).length === 0) {
      // If there are no search parameters, get first 10 of all orders
      resultOrders = (await ordersData.getAllOrders())?.toReversed().slice(0, 10)
    } else {
      // If there are search parameters, construct a query object
      const query = {}

      // Check for priority parameter
      if (searchParams.priority) {
        query.priority = searchParams.priority
      }

      // Check for state parameter
      if (searchParams.state) {
        query.state = searchParams.state
      }

      // Check for search parameter
      if (searchParams.search) {
        const escapedSearch = escapeStringRegexp(searchParams.search)

        // Search among 'info', 'contacts', 'goods.season', 'goods.material', and 'goods.production' fields
        query.$or = [
          { info: { $regex: escapedSearch, $options: 'i' } },
          { contacts: { $regex: escapedSearch, $options: 'i' } },
          { 'goods.season': { $regex: escapedSearch, $options: 'i' } },
          { 'goods.material': { $regex: escapedSearch, $options: 'i' } },
          { 'goods.production': { $regex: escapedSearch, $options: 'i' } }
        ]
      }

      // Find orders based on the constructed query
      resultOrders = (await ordersData.findOrder(query))?.toReversed()
    }

    // Check for all parameter
    if (searchParams.all) {
      resultOrders = (await ordersData.getAllOrders())?.toReversed()
    }

    res.json(resultOrders)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// /api/orders?contacts=0989880990 Слава&state=в роботі

// POST: Додати нове замовлення
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const newOrderData = req.body

    // Calculate and add new fields to each goods item
    const goodsWithId = newOrderData.goods?.map(goodsItem => {
      const goodArea = goodsItem.a * goodsItem.b * goodsItem.qty

      // Calculate the sum of qty in the color array
      const colorQtySum =
        goodsItem.color?.reduce((sum, color) => sum + color.qty, 0) || 1

      // Calculate divider and colorArea for each color
      const colorWithCalculation = goodsItem.color?.map(color => {
        const divider = colorQtySum
        const colorArea = Math.ceil((goodArea * color.qty) / divider)

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
    res.json({ orderId: addedOrder._id, ...addedOrder })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// PUT: Оновити існуюче замовлення
app.put('/api/orders/:id', authenticateToken, async (req, res) => {
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

// PUT видалити товар із замовлення
app.put('/api/orders/:id/remove-good/:goodId', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id
    const goodIdToRemove = req.params.goodId
    const updatedOrder = await ordersData.removeGoodFromOrder(
      orderId,
      goodIdToRemove
    )

    res.json(updatedOrder)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// PUT додати товар до замовлення
app.put('/api/orders/:id/add-good', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id
    const newGoodData = req.body
    newGoodData._id = new mongoose.Types.ObjectId()
    newGoodData.goodArea = newGoodData.a * newGoodData.b * newGoodData.qty

    // Calculate the sum of qty in the color array
    const colorQtySum = newGoodData.color?.reduce(
      (sum, color) => sum + color.qty,
      0
    )

    // Calculate divider and colorArea for each color
    const colorWithCalculation = newGoodData.color?.map(color => {
      const divider = colorQtySum
      const colorArea = Math.ceil((newGoodData.goodArea * color.qty) / divider)

      return {
        ...color,
        divider,
        colorArea
      }
    })
    newGoodData.color = colorWithCalculation || []

    const updatedOrder = await ordersData.addGoodToOrder(orderId, newGoodData)

    res.json(updatedOrder)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// PUT редагувати товар в замовленні
app.put('/api/orders/:orderId/goods/:goodId', authenticateToken,  async (req, res) => {
  try {
    const orderId = req.params.orderId
    const goodId = req.params.goodId
    const updatedGoodData = req.body
    if (updatedGoodData.a && updatedGoodData.b && updatedGoodData.qty) {
      updatedGoodData.goodArea =
        updatedGoodData.a * updatedGoodData.b * updatedGoodData.qty
    }

    // Calculate the sum of qty in the color array
    if (updatedGoodData.color) {
      const colorQtySum = updatedGoodData.color.reduce(
        (sum, color) => sum + color.qty,
        0
      )
      // Calculate divider and colorArea for each color
      const colorWithCalculation = updatedGoodData.color.map(color => {
        const divider = colorQtySum
        const colorArea = Math.ceil(
          (updatedGoodData.goodArea * color.qty) / divider
        )
        return {
          ...color,
          divider,
          colorArea
        }
      })

      updatedGoodData.color = colorWithCalculation || []
    }

    const updatedOrder = await ordersData.updateGoodInOrder(
      orderId,
      goodId,
      updatedGoodData
    )

    res.json(updatedOrder)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// DELETE: Видалити замовлення
app.delete('/api/orders/:id', authenticateToken, async (req, res) => {
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
app.get('/api/materials', authenticateToken, async (req, res) => {
  try {
    const allMaterials = await materialsData.getAllMaterials()
    res.json(allMaterials)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// POST: Додати нові матеріали
app.post('/api/materials', authenticateToken, async (req, res) => {
  try {
    const newMaterials = req.body

    const addedMaterials = []

    for (const material of newMaterials) {
      const addedMaterial = await materialsData.addNewMaterial(material)
      addedMaterials.push(addedMaterial)
    }

    res.json(addedMaterials)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// PUT: Оновити існуючий матеріал
app.put('/api/materials/:id', authenticateToken,  async (req, res) => {
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

// PUT: Оновити існуючі матеріали
app.put('/api/materials', authenticateToken, async (req, res) => {
  try {
    const updatedMaterials = req.body
    const materialIds = updatedMaterials.map(material => material._id)

    const result = await materialsData.updateMaterials(
      materialIds,
      updatedMaterials
    )

    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// DELETE: Видалити матеріал
app.delete('/api/materials/:id', authenticateToken, async (req, res) => {
  try {
    const materialId = req.params.id
    const deletionResult = await materialsData.deleteMaterial(materialId)
    res.json(deletionResult)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// GET: Пошук матеріалів за параметрами
app.get('/api/materials/search', authenticateToken, async (req, res) => {
  try {
    const searchParams = req.query // Отримайте параметри пошуку з запиту
    const foundMaterials = await materialsData.findMaterial(searchParams)
    res.json(foundMaterials)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// Товари на складі

const goodsData = new GoodsDataAccess()

// GET: Отримати всі товари або пошук за товарами
app.get('/api/goods', authenticateToken, async (req, res) => {
  try {
    const searchParams = req.query

    // Decode URL-encoded components
    for (const key in searchParams) {
      searchParams[key] = decodeURIComponent(searchParams[key])
    }

    let resultGoods

    if (Object.keys(searchParams).length === 0) {
      // If there are no search parameters, get all goods
      resultGoods = await goodsData.getAllGoods()
      resultGoods = resultGoods.filter(item => item.qty > 0)
    } else {
      // If there are search parameters, construct a query object
      const query = {}

      // Check for exact numeric search parameter for 'a'
      if (!isNaN(searchParams.a)) {
        query.a = +searchParams.a
      }

      // Check for exact numeric search parameter for 'b'
      if (!isNaN(searchParams.b)) {
        query.b = +searchParams.b
      }

      // Check for season parameter
      if (searchParams.season) {
        query.season = searchParams.season
      }

      // Check for search parameter
      if (searchParams.search) {
        const escapedSearch = escapeStringRegexp(searchParams.search)
        // Search among 'material', 'season', 'color.name' fields
        query.$or = [
          { material: { $regex: escapedSearch, $options: 'i' } },
          { season: { $regex: escapedSearch, $options: 'i' } },
          { 'deliveries.date': { $regex: escapedSearch, $options: 'i' } },
          { 'deliveries.orderId': { $regex: escapedSearch, $options: 'i' } },
          {
            'deliveries.orderContacts': { $regex: escapedSearch, $options: 'i' }
          },
          { 'color.name': { $regex: escapedSearch, $options: 'i' } }
        ]
      }

      resultGoods = await goodsData.findGood(query)
    }

    // Sorting the resultGoods array by 'a' and then by 'b'
    resultGoods.sort((a, b) => {
      if (a.a !== b.a) {
        return a.a - b.a
      } else {
        return a.b - b.b
      }
    })

    res.json(resultGoods)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// POST: Додати новий товар або оновити існуючий
app.post('/api/goods', authenticateToken, async (req, res) => {
  try {
    const newGoodData = req.body

    // Перевірка, чи вже існує товар з вказаними параметрами
    const existingGood = await goodsData.findGood({
      a: newGoodData.a,
      b: newGoodData.b,
      material: newGoodData.material,
      colorCode: newGoodData.color
        ?.map(color => `${color.name}:${color.qty}`)
        .join(', ')
    })

    if (existingGood.length > 0) {
      // Якщо товар існує, оновити його
      const updatedGood = existingGood[0]

      updatedGood.qty += newGoodData.qty
      updatedGood.goodArea = +updatedGood.a * +updatedGood.b * +updatedGood.qty

      await goodsData.updateGood(updatedGood._id, updatedGood)

      res.json(updatedGood)
    } else {
      // Якщо товар не існує, додати новий
      newGoodData._id = new mongoose.Types.ObjectId()
      newGoodData.goodArea = +newGoodData.a * +newGoodData.b * +newGoodData.qty
      newGoodData.colorCode = newGoodData.color
        ?.map(color => `${color.name}:${color.qty}`)
        .join(', ')

      const createdGood = await goodsData.addNewGood(newGoodData)

      res.json(createdGood)
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// PUT: Оновити існуючий товар
app.put('/api/goods/:id', authenticateToken, async (req, res) => {
  try {
    const goodId = req.params.id
    const updatedData = req.body
    updatedData.goodArea = updatedData.a * updatedData.b * updatedData.qty
    const updatedGood = await goodsData.updateGood(goodId, updatedData)
    res.json(updatedGood)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// DELETE: Видалити товар
app.delete('/api/goods/:id', authenticateToken, async (req, res) => {
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
app.get('/api/goods/search', authenticateToken, async (req, res) => {
  try {
    const searchParams = req.query // Отримайте параметри пошуку з запиту
    const foundGoods = await goodsData.findGood(searchParams)
    res.json(foundGoods)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// Виробництво

const productionData = new ProductionDataAccess()

// GET: Отримати всі виробництва
app.get('/api/production', authenticateToken, async (req, res) => {
  try {
    const allProductions = await productionData.getAllProductions()
    res.json(allProductions)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// GET: Отримати одне виробництво
app.get('/api/production/:name', authenticateToken, async (req, res) => {
  try {
    const productionName = req.params.name
    const production = await productionData.getProduction(productionName)
    res.json(production)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// POST: Додати нове виробництво
app.post('/api/production', authenticateToken, async (req, res) => {
  try {
    const newProduction = req.body
    newProduction._id = new mongoose.Types.ObjectId()
    const addedProduction = await productionData.addNewProduction(newProduction)
    res.json(addedProduction)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// PUT: Оновити існуюче виробництво
app.put('/api/production/:id', authenticateToken, async (req, res) => {
  try {
    const productionId = req.params.id
    const updatedData = req.body

    const updatedMaterials = updatedData.materials?.map(material => {
      if (!material._id) {
        material._id = new mongoose.Types.ObjectId()
        material.qty = material.qty < 0 ? 0 : Math.floor(material.qty)
      }
      return material
    })

    updatedData.materials = updatedMaterials || []

    const updateProduction = await productionData.updateProduction(
      productionId,
      updatedData
    )

    res.json(updateProduction)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// PUT: Додати матеріал на виробництво
app.put('/api/production/:id/materials', authenticateToken, async (req, res) => {
  try {
    const productionId = req.params.id
    const updatedData = req.body

    const production = await productionData.findProduction({
      _id: productionId
    })

    if (!production) {
      throw new Error('Виробництво не знайдено')
    }

    // Проходимо по оновлених матеріалах
    updatedData.materials.forEach(updatedMaterial => {
      // Шукаємо матеріал за кольором та матеріалом
      const existingMaterial = production[0].materials.find(
        material =>
          material.color === updatedMaterial.color &&
          material.material === updatedMaterial.material
      )

      if (existingMaterial) {
        // Якщо матеріал існує, оновлюємо його qty
        existingMaterial.qty += updatedMaterial.qty
      } else {
        // Якщо матеріал не існує, додаємо його до масиву матеріалів виробництва
        production[0].materials.push({
          _id: new mongoose.Types.ObjectId(),
          color: updatedMaterial.color,
          material: updatedMaterial.material,
          qty: Math.floor(updatedMaterial.qty)
        })
      }
    })

    // Зберігаємо оновлене виробництво
    await production[0].save()

    res.json(production[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// POST: Додати товар на виробництво
app.post('/api/production/:id/goods', authenticateToken, async (req, res) => {
  try {
    const productionId = req.params.id
    const newGoodData = req.body
    newGoodData._id = new mongoose.Types.ObjectId()
    newGoodData.date = new Date()
    newGoodData.delivered = 0
    newGoodData.goodArea = newGoodData.a * newGoodData.b * newGoodData.qty

    // Calculate the sum of qty in the color array
    const divider = newGoodData.color?.reduce(
      (sum, color) => sum + color.qty,
      0
    )

    // Calculate divider and colorArea for each color
    const colorWithCalculation = newGoodData.color?.map(color => {
      const colorArea = Math.ceil((newGoodData.goodArea * color.qty) / divider)

      return {
        ...color,
        divider,
        colorArea
      }
    })

    newGoodData.color = colorWithCalculation || []

    if (newGoodData.a && newGoodData.b && newGoodData.qty) {
      newGoodData.goodArea = newGoodData.a * newGoodData.b * newGoodData.qty
    }

    const updateProduction = await productionData.addGoodToProduction(
      productionId,
      newGoodData
    )

    res.json(updateProduction)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// PUT редагувати товар на виробництві
app.put('/api/production/:productionId/goods/:goodId', authenticateToken, async (req, res) => {
  try {
    const productionId = req.params.productionId
    const goodId = req.params.goodId
    const updatedGoodData = req.body
    if (updatedGoodData.a && updatedGoodData.b && updatedGoodData.qty) {
      updatedGoodData.goodArea =
        updatedGoodData.a * updatedGoodData.b * updatedGoodData.qty
    }
    updatedGoodData.date = new Date()

    // Calculate the sum of qty in the color array
    const colorQtySum = updatedGoodData.color?.reduce(
      (sum, color) => sum + color.qty,
      0
    )
    // Calculate divider and colorArea for each color
    const colorWithCalculation = updatedGoodData.color?.map(color => {
      const divider = colorQtySum
      const colorArea = Math.ceil(
        (updatedGoodData.goodArea * color.qty) / divider
      )
      return {
        ...color,
        divider,
        colorArea
      }
    })

    updatedGoodData.color = colorWithCalculation || []

    const updatedProduction = await productionData.updateGoodInProduction(
      productionId,
      goodId,
      updatedGoodData
    )

    res.json(updatedProduction)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// PUT видалити товар з виробництва
app.put('/api/production/:id/remove-good/:goodId', authenticateToken, async (req, res) => {
  try {
    const productionId = req.params.id
    const goodIdToRemove = req.params.goodId
    const updatedProduction = await productionData.removeGoodFromProduction(
      productionId,
      goodIdToRemove
    )

    res.json(updatedProduction)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// DELETE: Видалити виробництво
app.delete('/api/production/:id', authenticateToken, async (req, res) => {
  try {
    const productionId = req.params.id
    const deletionResult = await productionData.deleteProduction(productionId)
    res.json(deletionResult)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// Кольори

// GET: Отримати всі кольори

const colorData = new ColorsDataAccess

app.get('/api/colors', async (req, res) => {
  try {
    const colors = await colorData.getColors()
    res.json(colors)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})

// Схеми кольорів

// GET: Отримати всі схеми кольорів

const colorSchemesData = new ColorSchemesDataAccess

app.get('/api/color-schemes', async (req, res) => {
  try {
    const colorSchemes = await colorSchemesData.getColorSchemes()
    res.json(colorSchemes)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Помилка сервера' })
  }
})


