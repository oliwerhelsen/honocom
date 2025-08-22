import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import { Module } from './shared/decorators/module.decorator';
import { BaseModule } from './shared/module/base-module';
import { ModuleRegistry } from './shared/module/module-registry';
import { EventBus } from './shared/events/event-bus';
import { corsMiddleware, errorHandler, requestLogger } from './shared/middleware';

// Import modules
import { CatalogModule } from './modules/catalog/catalog.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CheckoutModule } from './modules/checkout/checkout.module';

@Module({
  imports: [CatalogModule, OrdersModule, CheckoutModule],
  providers: [EventBus],
  exports: [],
})
export class AppModule extends BaseModule {
  private app: Hono;
  private moduleRegistry: ModuleRegistry;

  constructor() {
    super();
    this.app = new Hono();
    this.moduleRegistry = new ModuleRegistry();
    this.setupApplication();
  }

  private setupApplication(): void {
    console.log('🚀 Initializing HonoCom Core Application');

    // Setup global middleware
    this.setupMiddleware();

    // Register modules
    this.registerModules();

    // Setup routes
    this.setupRoutes();

    // Setup health checks
    this.setupHealthChecks();

    console.log('✅ HonoCom Core Application initialized successfully');
  }

  private setupMiddleware(): void {
    console.log('🔧 Setting up middleware');
    
    this.app.use('*', corsMiddleware);
    this.app.use('*', requestLogger);
    this.app.use('*', prettyJSON());
    this.app.use('*', errorHandler);
  }

  private registerModules(): void {
    console.log('📦 Registering modules');

    this.moduleRegistry.registerModule('catalog', CatalogModule);
    this.moduleRegistry.registerModule('orders', OrdersModule);
    this.moduleRegistry.registerModule('checkout', CheckoutModule);
  }

  private setupRoutes(): void {
    console.log('🛣️ Setting up routes');

    // Root endpoint
    this.app.get('/', (c) => {
      return c.json({
        name: 'HonoCom Core API',
        version: '1.0.0',
        status: 'running',
        modules: this.getLoadedModules(),
        timestamp: new Date().toISOString(),
      });
    });

    // API info endpoint
    this.app.get('/api', (c) => {
      return c.json({
        name: 'HonoCom Core API',
        version: '1.0.0',
        endpoints: {
          catalog: '/api/v1/catalog',
          orders: '/api/v1/orders',
          checkout: '/api/v1/checkout',
        },
        timestamp: new Date().toISOString(),
      });
    });

    // Register module routes
    this.moduleRegistry.setupRoutes(this.app);
  }

  private setupHealthChecks(): void {
    this.app.get('/health', (c) => {
      return c.json({
        status: 'healthy',
        modules: this.getModuleHealth(),
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      });
    });

    this.app.get('/ready', (c) => {
      const moduleHealth = this.getModuleHealth();
      const allHealthy = Object.values(moduleHealth).every(status => status === 'healthy');

      return c.json({
        status: allHealthy ? 'ready' : 'not ready',
        modules: moduleHealth,
        timestamp: new Date().toISOString(),
      }, allHealthy ? 200 : 503);
    });
  }

  private getLoadedModules(): string[] {
    return this.moduleRegistry.getAllModules().map(module => module.constructor.name);
  }

  private getModuleHealth(): Record<string, string> {
    const modules = this.moduleRegistry.getAllModules();
    const health: Record<string, string> = {};

    modules.forEach(module => {
      const moduleName = module.constructor.name.replace('Module', '').toLowerCase();
      health[moduleName] = 'healthy'; // In real implementation, check actual health
    });

    return health;
  }

  getApp(): Hono {
    return this.app;
  }

  getModuleRegistry(): ModuleRegistry {
    return this.moduleRegistry;
  }
}