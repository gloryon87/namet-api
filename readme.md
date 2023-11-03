Ендпойнти:

<!-- ЗАМОВЛЕННЯ -->

<!-- GET: Отримати всі замовлення -->
/api/orders

<!-- GET: Пошук за параметрами -->
/api/orders?contacts=0989880990 Слава&state=в роботі

<!-- POST: Додати нове замовлення -->
/api/orders
body:
{
  "contacts": "0989880990 Слава",
  "goods": [
    {
      "a": 4,
      "b": 6,
      "qty": 10,
      "season": "осінь",
      "material": "спанбонд",
      "color": {
        "baige10": 2,
        "olive": 2,
        "brown": 1
      },
      "production": "Коротич"
    }
  ],
  "date": "2023-10-27T18:20:58Z",
  "info": "string",
  "state": "в роботі",
  "priority": true,
  "deadline": "2023-12-27T18:20:58Z",
  "comment": "comment"
}

<!-- PUT: Оновити існуюче замовлення -->
/api/orders/:id
body:
{
    "contacts": "0989880990 Слава"
}

<!-- DELETE: Видалити замовлення -->
/api/orders/:id


<!-- ЗАЛИШКИ МАТЕРІАЛІВ -->

<!-- GET: Отримати всі матеріали -->
/api/materials

<!-- POST: Додати новий матеріал -->
/api/materials
body:
{
"color": "brown",
"qty": 200
}

<!-- PUT: Оновити існуючий матеріал -->
/api/materials/:id
body:
{
"qty": 200
}

<!-- DELETE: Видалити матеріал -->
/api/materials/:id

<!-- GET: Пошук матеріалів за параметрами -->
/api/materials/search?color=brown


<!-- ТОВАРИ НА СКЛАДІ -->

<!-- GET: Отримати всі товари -->
/api/goods

<!-- POST: Додати новий товар -->
/api/goods
body:
{
      "a": 4,
      "b": 8,
      "qty": 10,
      "season": "осінь",
      "material": "спанбонд",
      "color": {
        "baige10": 2,
        "olive": 2,
        "brown": 1
      }
    }

<!-- PUT: Оновити існуючий товар -->
/api/goods/:id
body:
{
    "qty": 10
}

<!-- DELETE: Видалити товар -->
/api/goods/:id

<!-- GET: Пошук товарів за параметрами -->
/api/goods/search?season=осінь
