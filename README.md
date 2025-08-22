# HonoCom - E-commerce Platform

HonoCom är en modern e-handelsplattform byggd med Domain-Driven Design (DDD) arkitektur, TypeScript och Hono.js. Plattformen är designad för att vara modulär, skalbar och underhållbar.

## 🏗️ Arkitektur

Projektet följer Domain-Driven Design principer och är organiserat i en Clean Architecture:

- **Domain Layer** - Affärslogik och domänmodeller
- **Application Layer** - Use cases och applikationslogik
- **Infrastructure Layer** - Databas, externa tjänster
- **Presentation Layer** - HTTP API med Hono.js

## 📦 Projektstruktur

```
honocom/
├── apps/
│   └── core/                 # Huvud-API applikation
│       ├── src/
│       │   ├── modules/      # Funktionella moduler
│       │   │   ├── catalog/  # Produktkatalog
│       │   │   ├── orders/   # Orderhantering
│       │   │   ├── checkout/ # Checkout-process
│       │   │   ├── inventory/# Lagerhantering
│       │   │   ├── pricing/  # Prissättning
│       │   │   └── notifications/ # Notifieringar
│       │   ├── shared/       # Delad kod
│       │   └── config/       # Konfiguration
├── packages/
│   ├── domain/              # Domänmodeller
│   │   ├── catalog/
│   │   ├── orders/
│   │   └── shared-kernel/
│   ├── application/         # Use cases
│   │   ├── catalog/
│   │   └── orders/
│   └── infrastructure/      # Dataåtkomst
│       ├── catalog/
│       ├── orders/
│       └── shared/
```

## 🚀 Kom igång

### Förutsättningar

- Node.js 18+
- pnpm 9.0+
- Docker & Docker Compose
- PostgreSQL

### Installation

1. **Klona projektet**

```bash
git clone <repository-url>
cd honocom
```

2. **Installera beroenden**

```bash
pnpm install
```

3. **Starta databas**

```bash
pnpm db:up
```

4. **Kör migrations**

```bash
pnpm db:migrate
```

5. **Starta utvecklingsserver**

```bash
pnpm dev
```

API:et kommer att vara tillgängligt på `http://localhost:3000`

## 🔧 Användning

### API Endpoints

#### Produktkatalog

- `POST /api/v1/catalog/products` - Skapa produkt
- `GET /api/v1/catalog/products/:id` - Hämta produkt
- `GET /api/v1/catalog/products` - Sök produkter
- `GET /api/v1/catalog/categories` - Hämta kategorier

#### Orders

- `POST /api/v1/orders` - Skapa order
- `GET /api/v1/orders/:id` - Hämta order
- `PATCH /api/v1/orders/:id/status` - Uppdatera orderstatus
- `GET /api/v1/orders/customer/:customerId` - Hämta kundorders

#### Checkout

- `POST /api/v1/checkout` - Genomför checkout
- `POST /api/v1/checkout/summary` - Få checkout-sammanfattning

### Exempel: Skapa en produkt

```bash
curl -X POST http://localhost:3000/api/v1/catalog/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15",
    "description": "Senaste iPhone modellen",
    "sku": "IPHONE-15-128GB",
    "listPrice": 12999,
    "salePrice": 11999,
    "currency": "SEK"
  }'
```

### Exempel: Skapa en order

```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer_123",
    "items": [
      {
        "productId": "prod_123",
        "quantity": 2,
        "unitPrice": 299
      }
    ]
  }'
```

## 🏛️ Moduler

### Catalog Module

Hanterar produktkatalog, kategorier och produktinformation.

**Funktionalitet:**

- Produkthantering (CRUD)
- Kategorisering
- Produktvarianter
- Prissättning
- Produktsökning

### Orders Module

Hanterar orderprocessen från skapande till fullbordan.

**Funktionalitet:**

- Skapa och hantera orders
- Orderstatus-uppdateringar
- Kundorderhistorik
- Ordervalidering

### Checkout Module

Koordinerar checkout-processen mellan olika moduler.

**Funktionalitet:**

- Checkout-workflow
- Betalningsintegration
- Inventory-kontroll
- Orderbekräftelse

## 💾 Databas

Projektet använder PostgreSQL med Drizzle ORM för dataåtkomst.

### Databas-kommandon

```bash
# Starta databas
pnpm db:up

# Stoppa databas
pnpm db:down

# Visa loggar
pnpm db:logs

# Återställ databas
pnpm db:reset

# Generera schema
pnpm db:generate

# Kör migrations
pnpm db:migrate

# Öppna studio
pnpm db:studio
```

## 🧪 Testing

Projektet använder Jest för enhetstester.

```bash
# Kör alla tester
pnpm test

# Kör tester för specifik modul
pnpm test --filter=@domain/catalog

# Kör tester i watch-läge
pnpm test --watch
```

## 📋 Utveckling

### Code Style

- TypeScript för typsäkerhet
- Prettier för kodformatering
- ESLint för kodkvalitet

```bash
# Formatera kod
pnpm format

# Kontrollera typer
pnpm check-types

# Lint kod
pnpm lint
```

### Build

```bash
# Bygg hela projektet
pnpm build

# Bygg specifik modul
pnpm build --filter=@apps/core
```

## 🔍 Monitorering

### Health Checks

- `/health` - Allmän hälsokontroll
- `/ready` - Readiness probe
- `/api/v1/catalog/health` - Catalog module health
- `/api/v1/orders/health` - Orders module health
- `/api/v1/checkout/health` - Checkout module health

## 📝 Arkitektur & Design

### Domain-Driven Design

Projektet följer DDD-principer:

- **Bounded Contexts** - Modulerna representerar olika bounded contexts
- **Aggregates** - Domänmodeller som Product, Order
- **Value Objects** - ProductName, ProductPrice, etc.
- **Domain Events** - ProductCreated, ProductPriceChanged
- **Repositories** - Abstraktion för dataåtkomst

### CQRS Pattern

Command Query Responsibility Segregation implementeras genom:

- **Commands** - CreateProduct, UpdateProduct
- **Queries** - GetProduct, SearchProducts
- **Handlers** - Separata handlers för commands och queries

### Dependency Injection

Projektet använder Inversify för dependency injection för att uppnå:

- Löst kopplad kod
- Testbarhet
- Moduläritet

## 🔒 Säkerhet

- Input-validering på alla endpoints
- Error handling och säker felrapportering
- Environment-variabler för känslig konfiguration

## 🚀 Deployment

### Environment Variables

```bash
# Databas
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=mysecretpassword
DB_NAME=honocom

# Server
PORT=3000
NODE_ENV=production
```

### Docker

```bash
# Starta hela stacken
docker-compose up -d

# Stoppa stacken
docker-compose down
```

## 🤝 Bidrag

1. Fork projektet
2. Skapa en feature-branch (`git checkout -b feature/amazing-feature`)
3. Commita dina ändringar (`git commit -m 'Add some amazing feature'`)
4. Push till branchen (`git push origin feature/amazing-feature`)
5. Öppna en Pull Request

## 📄 Licens

Detta projekt är licensierat under MIT License.

## 🔗 Resurser

- [Hono.js Documentation](https://hono.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
