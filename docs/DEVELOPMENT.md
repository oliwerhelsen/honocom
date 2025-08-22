# Utvecklarguide

## Introduktion

Denna guide hjälper utvecklare att komma igång med HonoCom-projektet och förstå utvecklingsprocessen.

## Utvecklingsmiljö

### Förutsättningar

- **Node.js** 18+ (rekommenderat: 20.x)
- **pnpm** 9.0+ (pakethanterare)
- **Docker** & **Docker Compose** (för databas)
- **Git** (versionshantering)
- **IDE/Editor** (rekommenderat: VS Code)

### IDE Konfiguration

#### VS Code Extensions

Rekommenderade extensions:

- TypeScript Importer
- ESLint
- Prettier
- Jest
- Docker
- Thunder Client (för API-testning)

#### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "jest.autoRun": "off"
}
```

## Projektstruktur

```
honocom/
├── apps/
│   └── core/                    # Huvud-API applikation
│       ├── src/
│       │   ├── modules/         # Funktionella moduler
│       │   ├── shared/          # Delad kod för core app
│       │   ├── config/          # Applikationskonfiguration
│       │   ├── __tests__/       # Integration tests
│       │   └── main.ts          # Entry point
│       ├── jest.config.cjs      # Jest konfiguration
│       └── package.json
├── packages/
│   ├── domain/                  # Domänlager
│   │   ├── catalog/
│   │   ├── orders/
│   │   └── shared-kernel/       # Gemensamma domänkoncept
│   ├── application/             # Applikationslager
│   │   ├── catalog/
│   │   └── orders/
│   └── infrastructure/          # Infrastrukturlager
│       ├── catalog/
│       ├── orders/
│       └── shared/              # Gemensam infrastruktur
├── docs/                        # Dokumentation
├── docker-compose.yml           # Utvecklingsdatabas
└── package.json                 # Root package.json
```

### Namnkonventioner

#### Filer och mappar

- **kebab-case** för filer och mappar: `product-repository.ts`
- **PascalCase** för klasser: `ProductRepository`
- **camelCase** för funktioner och variabler: `createProduct`

#### Git branches

- `main` - Produktionskod
- `develop` - Utvecklingsgren
- `feature/beskrivning` - Nya funktioner
- `fix/beskrivning` - Bugfixar
- `refactor/beskrivning` - Refactoring

## Utvecklingsworkflow

### 1. Setup

```bash
# Klona och installera
git clone <repo-url>
cd honocom
pnpm install

# Starta databas
pnpm db:up

# Kör migrations
pnpm db:migrate

# Starta utvecklingsserver
pnpm dev
```

### 2. Feature Development

```bash
# Skapa feature branch
git checkout -b feature/ny-funktion

# Utveckla funktionen
# ... kod ...

# Testa lokalt
pnpm test
pnpm lint
pnpm build

# Commita ändringar
git add .
git commit -m "feat: lägg till ny funktion"
git push origin feature/ny-funktion

# Skapa pull request
```

### 3. Testing

```bash
# Kör alla tester
pnpm test

# Kör tester för specifik modul
pnpm test --filter=@domain/catalog

# Kör tester i watch-läge
pnpm test --watch

# Coverage
pnpm test --coverage
```

## Skapande av ny funktionalitet

### 1. Ny Domänmodell

När du skapar en ny domänmodell:

```typescript
// packages/domain/catalog/src/category.ts
import { AggregateRoot } from "@domain/shared-kernel";
import { CategoryId } from "./value-object/category-id";
import { CategoryName } from "./value-object/category-name";

export interface CategoryProps {
  name: CategoryName;
  description: string;
  parentId?: CategoryId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Category extends AggregateRoot<CategoryId> {
  private constructor(
    id: CategoryId,
    private props: CategoryProps
  ) {
    super(id);
    this.validate();
  }

  static create(
    name: CategoryName,
    description: string,
    parentId?: CategoryId,
    id?: CategoryId
  ): Category {
    const categoryId = id ?? CategoryId.create();
    const now = new Date();

    return new Category(categoryId, {
      name,
      description,
      parentId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Getters och business methods...

  private validate(): void {
    if (!this.props.name) {
      throw new Error("Category name is required");
    }
  }
}
```

### 2. Ny Application Service

```typescript
// packages/application/catalog/src/handlers/create-category.handler.ts
import { inject, injectable } from "inversify";
import { CreateCategoryCommand } from "../commands/create-category.command";
import { CategoryRepository } from "../repositories/category-repository";
import { Category, CategoryName } from "@domain/catalog";

@injectable()
export class CreateCategoryHandler {
  constructor(
    @inject("CategoryRepository")
    private categoryRepository: CategoryRepository
  ) {}

  async handle(command: CreateCategoryCommand): Promise<void> {
    const categoryName = CategoryName.create(command.name);

    const category = Category.create(
      categoryName,
      command.description,
      command.parentId
    );

    await this.categoryRepository.save(category);
  }
}
```

### 3. Infrastructure Implementation

```typescript
// packages/infrastructure/catalog/src/repositories/sql-category-repository.ts
import { injectable } from "inversify";
import { CategoryRepository } from "@application/catalog";
import { Category, CategoryId } from "@domain/catalog";

@injectable()
export class SqlCategoryRepository implements CategoryRepository {
  async save(category: Category): Promise<void> {
    // Implementera med Drizzle ORM
  }

  async findById(id: CategoryId): Promise<Category | null> {
    // Implementera med Drizzle ORM
  }

  async findByName(name: string): Promise<Category | null> {
    // Implementera med Drizzle ORM
  }
}
```

### 4. API Endpoint

```typescript
// apps/core/src/modules/catalog/catalog.module.ts
app.post("/api/v1/catalog/categories", async (c) => {
  try {
    const categoryData = await c.req.json();

    if (!categoryData.name) {
      return c.json(
        {
          error: "Missing required field: name",
        },
        400
      );
    }

    const command = new CreateCategoryCommand(
      categoryData.name,
      categoryData.description,
      categoryData.parentId
    );

    await this.commandBus.send(command);

    return c.json(
      {
        message: "Category created successfully",
      },
      201
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return c.json(
      {
        error: "Failed to create category",
      },
      500
    );
  }
});
```

## Testing

### Unit Tests

#### Domain Tests

```typescript
// packages/domain/catalog/tests/category.test.ts
import { Category, CategoryName } from "../src/category";

describe("Category", () => {
  it("should create category with valid data", () => {
    const name = CategoryName.create("Electronics");
    const category = Category.create(name, "Electronic products");

    expect(category.name.value).toBe("Electronics");
    expect(category.isActive).toBe(true);
  });

  it("should throw error for invalid name", () => {
    expect(() => {
      CategoryName.create("");
    }).toThrow("Category name cannot be empty");
  });
});
```

#### Application Tests

```typescript
// packages/application/catalog/tests/create-category.handler.test.ts
import { CreateCategoryHandler } from "../src/handlers/create-category.handler";
import { CreateCategoryCommand } from "../src/commands/create-category.command";

describe("CreateCategoryHandler", () => {
  let handler: CreateCategoryHandler;
  let mockRepository: jest.Mocked<CategoryRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
    };
    handler = new CreateCategoryHandler(mockRepository);
  });

  it("should create category successfully", async () => {
    const command = new CreateCategoryCommand(
      "Electronics",
      "Electronic products"
    );

    await handler.handle(command);

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.objectContaining({ value: "Electronics" }),
      })
    );
  });
});
```

### Integration Tests

```typescript
// apps/core/src/__tests__/catalog.test.ts
import request from "supertest";
import { AppModule } from "../app.module";

describe("Catalog API", () => {
  let app: AppModule;

  beforeAll(async () => {
    app = new AppModule();
    // Setup test database
  });

  afterAll(async () => {
    // Cleanup
  });

  it("should create category", async () => {
    const response = await request(app.getApp().fetch)
      .post("/api/v1/catalog/categories")
      .send({
        name: "Test Category",
        description: "Test description",
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Category created successfully");
  });
});
```

## Databas

### Schema Definition

```typescript
// packages/infrastructure/shared/src/database/schema/categories.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  parentId: uuid("parent_id").references(() => categories.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### Migration

```bash
# Generera migration
pnpm db:generate

# Kör migration
pnpm db:migrate

# Återställ databas (utveckling)
pnpm db:reset
```

## Debugging

### Console Logs

```typescript
// Strukturerad logging
console.log("📦 Creating product:", {
  productId: product.id.value,
  name: product.name.value,
});
```

### VS Code Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Core App",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/core/src/main.ts",
      "runtimeArgs": ["-r", "tsx/cjs"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

## Performance

### Best Practices

1. **Lazy Loading** - Ladda bara nödvändig data
2. **Paginering** - Använd limit/offset för stora dataset
3. **Validation** - Validera tidigt för snabbare felhantering
4. **Connection Pooling** - Återanvänd databasanslutningar

### Monitoring

```typescript
// Mät prestanda
console.time("ProductCreation");
const product = await catalogService.createProduct(productData);
console.timeEnd("ProductCreation");
```

## Troubleshooting

### Vanliga Problem

#### Port Already in Use

```bash
# Hitta process som använder port 3000
lsof -i :3000

# Avsluta process
kill -9 <PID>
```

#### Database Connection Error

```bash
# Kontrollera att databas körs
docker ps

# Starta databas
pnpm db:up

# Kontrollera logs
pnpm db:logs
```

#### Module Resolution Error

```bash
# Rensa node_modules och installera om
rm -rf node_modules
pnpm install

# Bygg om packages
pnpm build
```

## Code Style

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### ESLint Rules

```json
// .eslintrc.json
{
  "extends": ["@repo/eslint-config/library.js"],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/explicit-function-return-type": "error"
  }
}
```

## Bidragande

### Pull Request Process

1. **Fork** projektet
2. **Skapa feature branch** från `develop`
3. **Implementera** funktion med tester
4. **Kör test suite** och fix eventuella problem
5. **Skapa PR** mot `develop`
6. **Vänta på review** och åtgärda feedback
7. **Merge** efter godkännande

### Commit Messages

Följ [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: lägg till kategori-hantering
fix: rätta produktvalidering
docs: uppdatera API-dokumentation
refactor: förbättra error handling
test: lägg till unit tests för Product
```

## Resurser

- [Hono.js Documentation](https://hono.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Inversify.js](https://inversify.io/)
