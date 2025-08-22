# Arkitektur Dokumentation

## Översikt

HonoCom är byggd med Domain-Driven Design (DDD) principer och följer en Clean Architecture pattern. Detta säkerställer en tydlig separation av ansvar och hög testbarhet.

## Arkitekturella Lager

### 1. Domain Layer (`packages/domain/`)

Innehåller ren affärslogik utan externa beroenden.

**Komponenter:**

- **Entities** - Affärsobjekt med identitet (Product, Order)
- **Value Objects** - Oföränderliga objekt utan identitet (ProductName, Money)
- **Aggregates** - Kluster av relaterade entities (Product + ProductVariant)
- **Domain Events** - Händelser som inträffar i domänen
- **Domain Services** - Affärslogik som inte naturligt hör till en entity

**Exempel struktur:**

```
packages/domain/catalog/
├── src/
│   ├── product.ts              # Aggregate root
│   ├── product-variant.ts      # Entity
│   ├── enums/
│   │   └── product-status.ts   # Enums
│   ├── events/
│   │   ├── product-created.ts  # Domain event
│   │   └── product-price-changed.ts
│   └── value-object/
│       ├── product-name.ts     # Value objects
│       ├── product-price.ts
│       └── category-id.ts
```

### 2. Application Layer (`packages/application/`)

Innehåller use cases och applikationslogik som koordinerar domänoperationer.

**Komponenter:**

- **Commands** - Skrivoperationer (CreateProduct, UpdateOrder)
- **Queries** - Läsoperationer (GetProduct, SearchProducts)
- **Handlers** - Implementerar use cases
- **Repositories** - Abstrakta interface för dataåtkomst

**Exempel struktur:**

```
packages/application/catalog/
├── src/
│   ├── commands/
│   │   ├── create-product.command.ts
│   │   └── update-product.command.ts
│   ├── queries/
│   │   └── get-product.query.ts
│   ├── handlers/
│   │   ├── create-product.handler.ts
│   │   └── get-product.handler.ts
│   └── repositories/
│       └── product-repository.ts
```

### 3. Infrastructure Layer (`packages/infrastructure/`)

Innehåller tekniska implementationer för dataåtkomst och externa tjänster.

**Komponenter:**

- **Repositories** - Konkreta implementationer av repository interfaces
- **Database** - Schema definitioner och migrations
- **External Services** - Integrationer med externa API:er

**Exempel struktur:**

```
packages/infrastructure/
├── catalog/
│   └── src/
│       └── repositories/
│           └── sql-product-repository.ts
└── shared/
    └── src/
        └── database/
            ├── schema/
            └── migrations/
```

### 4. Presentation Layer (`apps/core/`)

HTTP API som exponerar systemets funktionalitet.

**Komponenter:**

- **Modules** - Funktionella moduler (Catalog, Orders, Checkout)
- **Controllers** - HTTP endpoint handlers
- **Middleware** - Tvärskärande funktionalitet
- **Configuration** - Applikationskonfiguration

## Moduler

### Catalog Module

Ansvarar för produkthantering och katalogfunktionalitet.

**Kärnfunktioner:**

- Produktregistrering och hantering
- Kategorisering
- Prissättning och kampanjer
- Produktsökning
- Inventory-spårning

**API Endpoints:**

- `POST /api/v1/catalog/products` - Skapa produkt
- `GET /api/v1/catalog/products/:id` - Hämta produkt
- `GET /api/v1/catalog/products` - Sök produkter
- `GET /api/v1/catalog/categories` - Hämta kategorier

### Orders Module

Hanterar orderprocess från skapande till fullbordan.

**Kärnfunktioner:**

- Orderregistrering
- Statushantering
- Kundorderhistorik
- Ordervalidering

**API Endpoints:**

- `POST /api/v1/orders` - Skapa order
- `GET /api/v1/orders/:id` - Hämta order
- `PATCH /api/v1/orders/:id/status` - Uppdatera status
- `GET /api/v1/orders/customer/:customerId` - Hämta kundorders

### Checkout Module

Koordinerar checkout-processen mellan moduler.

**Kärnfunktioner:**

- Checkout-workflow
- Betalningsvalidering
- Inventory-kontroll
- Orderbekräftelse

**API Endpoints:**

- `POST /api/v1/checkout` - Genomför checkout
- `POST /api/v1/checkout/summary` - Checkout-sammanfattning

## Design Patterns

### Repository Pattern

Abstraherar dataåtkomst och möjliggör testning med mock data.

```typescript
// Domain/Application layer
interface ProductRepository {
  save(product: Product): Promise<void>;
  findById(id: ProductId): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
}

// Infrastructure layer
class SqlProductRepository implements ProductRepository {
  // Implementering med databas
}
```

### CQRS (Command Query Responsibility Segregation)

Separerar läs- och skrivoperationer för bättre performance och skalbarhet.

```typescript
// Command
export class CreateProductCommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly sku: string
  ) {}
}

// Query
export class GetProductQuery {
  constructor(public readonly productId: string) {}
}
```

### Event Sourcing (Partiell)

Domain events används för att kommunicera förändringar mellan moduler.

```typescript
export class ProductCreated extends DomainEvent {
  constructor(
    public readonly productId: ProductId,
    public readonly productName: string,
    public readonly categoryId?: string
  ) {
    super();
  }
}
```

### Dependency Injection

Använder Inversify för IoC container och dependency injection.

```typescript
@Module({
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule extends BaseModule {
  // Automatisk registrering av beroenden
}
```

## Dataflöde

### Skapa Produkt (Command Flow)

1. **HTTP Request** → CatalogModule
2. **Command** → CreateProductCommand
3. **Handler** → CreateProductHandler
4. **Domain** → Product.create()
5. **Repository** → Save to database
6. **Event** → ProductCreated event
7. **Response** → HTTP 201 Created

### Hämta Produkt (Query Flow)

1. **HTTP Request** → CatalogModule
2. **Query** → GetProductQuery
3. **Handler** → GetProductHandler
4. **Repository** → Load from database
5. **Response** → HTTP 200 OK

## Testningsstrategi

### Unit Tests

- **Domain Layer** - Testa affärslogik isolerat
- **Application Layer** - Testa use cases med mocks
- **Infrastructure Layer** - Testa dataåtkomst

### Integration Tests

- **API Endpoints** - Testa HTTP interfaces
- **Database** - Testa repository implementationer
- **Module Integration** - Testa samverkan mellan moduler

### Test Structure

```
src/
├── __tests__/          # Unit tests
├── tests/              # Integration tests
└── jest.config.js      # Jest konfiguration
```

## Säkerhet & Best Practices

### Input Validation

- Validering på HTTP-nivå
- Domain-validering i entities
- Database constraints

### Error Handling

- Strukturerad felhantering per lager
- Säker felrapportering till klienter
- Logging för debugging

### Performance

- Lazy loading av aggregates
- Paginering för stora dataset
- Caching av läsoperationer

## Framtida Utbyggnad

### Event Store

Implementera komplett event sourcing för audit trail och replay-funktionalitet.

### Microservices

Separera moduler till egna tjänster för oberoende deployment.

### API Gateway

Centraliserad routing och säkerhet för flera tjänster.

### Message Queues

Asynkron kommunikation mellan moduler för bättre skalbarhet.
