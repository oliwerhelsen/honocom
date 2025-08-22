# API Dokumentation

## Översikt

HonoCom Core API tillhandahåller RESTful endpoints för e-handelsoperationer. API:et är organiserat i moduler som speglar affärsdomänerna.

**Base URL:** `http://localhost:3000`

## Autentisering

För närvarande krävs ingen autentisering för utvecklingsmiljön. I produktion bör lämplig autentisering implementeras.

## Felhantering

API:et returnerar standardiserade HTTP statuskoder och JSON-felmeddelanden:

```json
{
  "error": "Beskrivning av felet",
  "code": "ERROR_CODE",
  "timestamp": "2025-08-22T10:30:00.000Z"
}
```

**Statuskoder:**

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Allmänna Endpoints

### Hälsokontroller

#### GET /health

Generell hälsokontroll för API:et.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-08-22T10:30:00.000Z"
}
```

#### GET /ready

Readiness probe för container orchestration.

**Response:**

```json
{
  "ready": true,
  "services": {
    "database": "ok",
    "modules": "ok"
  }
}
```

#### GET /

Root endpoint med API-information.

**Response:**

```json
{
  "name": "HonoCom Core API",
  "version": "1.0.0",
  "status": "running",
  "modules": ["catalog", "orders", "checkout"],
  "timestamp": "2025-08-22T10:30:00.000Z"
}
```

## Catalog API

### Produkter

#### POST /api/v1/catalog/products

Skapar en ny produkt.

**Request Body:**

```json
{
  "name": "iPhone 15",
  "description": "Senaste iPhone modellen",
  "sku": "IPHONE-15-128GB",
  "listPrice": 12999,
  "salePrice": 11999,
  "currency": "SEK",
  "categoryId": "smartphones"
}
```

**Required Fields:**

- `name` (string) - Produktnamn
- `sku` (string) - Unik produktkod
- `listPrice` (number) - Listpris

**Response (201):**

```json
{
  "message": "Product created successfully",
  "product": {
    "id": "prod_1692710400000",
    "name": "iPhone 15",
    "description": "Senaste iPhone modellen",
    "sku": "IPHONE-15-128GB",
    "listPrice": 12999,
    "salePrice": 11999,
    "currency": "SEK",
    "status": "Draft",
    "createdAt": "2025-08-22T10:30:00.000Z",
    "updatedAt": "2025-08-22T10:30:00.000Z"
  }
}
```

#### GET /api/v1/catalog/products/:id

Hämtar en specifik produkt.

**Path Parameters:**

- `id` (string) - Produkt ID

**Response (200):**

```json
{
  "id": "prod_123",
  "name": "iPhone 15",
  "description": "Senaste iPhone modellen",
  "sku": "IPHONE-15-128GB",
  "price": 12999,
  "currency": "SEK",
  "status": "Active",
  "createdAt": "2025-08-22T10:30:00.000Z",
  "updatedAt": "2025-08-22T10:30:00.000Z"
}
```

#### GET /api/v1/catalog/products

Söker och hämtar produkter.

**Query Parameters:**

- `q` (string) - Sökterm (optional)
- `limit` (number) - Max antal resultat (default: 10)
- `offset` (number) - Offset för paginering (default: 0)

**Response (200):**

```json
{
  "products": [
    {
      "id": "prod_123",
      "name": "iPhone 15",
      "sku": "IPHONE-15-128GB",
      "price": 12999,
      "currency": "SEK",
      "status": "Active"
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0,
  "hasMore": false
}
```

### Kategorier

#### GET /api/v1/catalog/categories

Hämtar alla kategorier.

**Response (200):**

```json
{
  "message": "Categories endpoint - coming soon",
  "categories": []
}
```

### Hälsokontroll

#### GET /api/v1/catalog/health

Hälsokontroll för catalog-modulen.

**Response (200):**

```json
{
  "module": "catalog",
  "status": "ok",
  "timestamp": "2025-08-22T10:30:00.000Z"
}
```

## Orders API

### Orders

#### POST /api/v1/orders

Skapar en ny order.

**Request Body:**

```json
{
  "customerId": "customer_123",
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2,
      "unitPrice": 299
    },
    {
      "productId": "prod_456",
      "quantity": 1,
      "unitPrice": 599
    }
  ],
  "shippingAddress": {
    "street": "Storgatan 1",
    "city": "Stockholm",
    "zipCode": "11122",
    "country": "SE"
  }
}
```

**Required Fields:**

- `customerId` (string) - Kund ID
- `items` (array) - Array av orderrader

**Response (201):**

```json
{
  "message": "Order created successfully",
  "order": {
    "id": "order_1692710400000",
    "customerId": "customer_123",
    "status": "Pending",
    "items": [
      {
        "productId": "prod_123",
        "quantity": 2,
        "unitPrice": 299,
        "totalPrice": 598
      }
    ],
    "totalAmount": 1197,
    "currency": "SEK",
    "createdAt": "2025-08-22T10:30:00.000Z"
  }
}
```

#### GET /api/v1/orders/:id

Hämtar en specifik order.

**Path Parameters:**

- `id` (string) - Order ID

**Response (200):**

```json
{
  "id": "order_123",
  "customerId": "customer_123",
  "status": "Processing",
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2,
      "unitPrice": 299,
      "totalPrice": 598
    }
  ],
  "totalAmount": 598,
  "currency": "SEK",
  "createdAt": "2025-08-22T10:30:00.000Z",
  "updatedAt": "2025-08-22T10:30:00.000Z"
}
```

#### PATCH /api/v1/orders/:id/status

Uppdaterar orderstatus.

**Path Parameters:**

- `id` (string) - Order ID

**Request Body:**

```json
{
  "status": "Shipped"
}
```

**Response (200):**

```json
{
  "message": "Order status updated successfully",
  "order": {
    "id": "order_123",
    "status": "Shipped",
    "updatedAt": "2025-08-22T10:30:00.000Z"
  }
}
```

#### GET /api/v1/orders/customer/:customerId

Hämtar alla orders för en kund.

**Path Parameters:**

- `customerId` (string) - Kund ID

**Response (200):**

```json
{
  "customerId": "customer_123",
  "orders": [
    {
      "id": "order_123",
      "status": "Delivered",
      "totalAmount": 598,
      "currency": "SEK",
      "createdAt": "2025-08-22T10:30:00.000Z"
    }
  ]
}
```

### Hälsokontroll

#### GET /api/v1/orders/health

Hälsokontroll för orders-modulen.

**Response (200):**

```json
{
  "module": "orders",
  "status": "ok",
  "timestamp": "2025-08-22T10:30:00.000Z"
}
```

## Checkout API

### Checkout

#### POST /api/v1/checkout

Genomför checkout-processen.

**Request Body:**

```json
{
  "customerId": "customer_123",
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "Storgatan 1",
    "city": "Stockholm",
    "zipCode": "11122",
    "country": "SE"
  },
  "paymentMethod": {
    "type": "card",
    "cardToken": "tok_123456"
  }
}
```

**Response (200):**

```json
{
  "status": "success",
  "orderId": "order_1692710400000",
  "paymentStatus": "completed",
  "totalAmount": 598,
  "currency": "SEK",
  "confirmationNumber": "CONF-123456"
}
```

**Response (400) - Failed:**

```json
{
  "status": "failed",
  "message": "Insufficient inventory for product prod_123",
  "errors": [
    {
      "field": "items[0].quantity",
      "message": "Only 1 item available"
    }
  ]
}
```

#### POST /api/v1/checkout/summary

Hämtar checkout-sammanfattning innan beställning.

**Request Body:**

```json
{
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "Storgatan 1",
    "city": "Stockholm",
    "zipCode": "11122",
    "country": "SE"
  }
}
```

**Response (200):**

```json
{
  "items": [
    {
      "productId": "prod_123",
      "productName": "iPhone 15",
      "quantity": 2,
      "unitPrice": 299,
      "totalPrice": 598
    }
  ],
  "subtotal": 598,
  "shipping": 49,
  "tax": 119.6,
  "total": 766.6,
  "currency": "SEK"
}
```

### Hälsokontroll

#### GET /api/v1/checkout/health

Hälsokontroll för checkout-modulen.

**Response (200):**

```json
{
  "module": "checkout",
  "status": "ok",
  "timestamp": "2025-08-22T10:30:00.000Z"
}
```

## Exempel med cURL

### Skapa en produkt

```bash
curl -X POST http://localhost:3000/api/v1/catalog/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Samsung Galaxy S24",
    "description": "Senaste Samsung flagship",
    "sku": "GALAXY-S24-256GB",
    "listPrice": 11999,
    "salePrice": 10999,
    "currency": "SEK"
  }'
```

### Skapa en order

```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer_123",
    "items": [
      {
        "productId": "prod_123",
        "quantity": 1,
        "unitPrice": 10999
      }
    ]
  }'
```

### Genomför checkout

```bash
curl -X POST http://localhost:3000/api/v1/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer_123",
    "items": [
      {
        "productId": "prod_123",
        "quantity": 1
      }
    ],
    "shippingAddress": {
      "street": "Storgatan 1",
      "city": "Stockholm",
      "zipCode": "11122",
      "country": "SE"
    }
  }'
```

## Rate Limiting

För närvarande finns ingen rate limiting implementerad. I produktion bör detta läggas till för att skydda API:et.

## Versioning

API:et använder URL-baserad versioning (`/api/v1/`). Framtida versioner kommer att introduceras som `/api/v2/` etc.
