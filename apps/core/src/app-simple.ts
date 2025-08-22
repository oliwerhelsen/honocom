import 'reflect-metadata';
import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import { Container } from 'inversify';
import { corsMiddleware, errorHandler, requestLogger } from './shared/middleware';

// Services
import { CatalogService } from './modules/catalog/services/catalog.service';
import { OrdersService } from './modules/orders/services/orders.service';
import { CheckoutService } from './modules/checkout/services/checkout.service';
import { CheckoutWorkflow } from './modules/checkout/workflows/checkout.workflow';

// Controllers
import { CatalogController } from './modules/catalog/controllers/catalog.controller';
import { OrdersController } from './modules/orders/controllers/orders.controller';

// Routes
import { setupCatalogRoutes } from './modules/catalog/routes/catalog.routes';
import { setupOrdersRoutes } from './modules/orders/routes/orders.routes';

export function createApp(): Hono {
  const app = new Hono();
  const container = new Container();

  console.log('🚀 Initializing HonoCom Core Application');

  // Setup container
  setupContainer(container);

  // Setup middleware
  setupMiddleware(app);

  // Setup routes
  setupRoutes(app, container);

  console.log('✅ HonoCom Core Application initialized successfully');

  return app;
}

function setupContainer(container: Container): void {
  console.log('📦 Setting up dependency injection container');

  // Bind services
  container.bind('CatalogService').to(CatalogService).inSingletonScope();
  container.bind('OrdersService').to(OrdersService).inSingletonScope();
  container.bind('CheckoutWorkflow').to(CheckoutWorkflow).inSingletonScope();
  container.bind('CheckoutService').to(CheckoutService).inSingletonScope();

  // Bind controllers
  container.bind('CatalogController').to(CatalogController).inSingletonScope();
  container.bind('OrdersController').to(OrdersController).inSingletonScope();
}

function setupMiddleware(app: Hono): void {
  console.log('🔧 Setting up middleware');
  
  app.use('*', corsMiddleware);
  app.use('*', requestLogger);
  app.use('*', prettyJSON());
  app.use('*', errorHandler);
}

function setupRoutes(app: Hono, container: Container): void {
  console.log('🛣️ Setting up routes');

  // Root endpoint
  app.get('/', (c) => {
    return c.json({
      name: 'HonoCom Core API',
      version: '1.0.0',
      status: 'running',
      modules: ['catalog', 'orders', 'checkout'],
      timestamp: new Date().toISOString(),
    });
  });

  // Health checks
  app.get('/health', (c) => {
    return c.json({
      status: 'healthy',
      modules: {
        catalog: 'healthy',
        orders: 'healthy',
        checkout: 'healthy'
      },
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  });

  // Module routes
  const catalogController = container.get<CatalogController>('CatalogController');
  const ordersController = container.get<OrdersController>('OrdersController');
  const checkoutService = container.get<CheckoutService>('CheckoutService');

  setupCatalogRoutes(app, catalogController);
  setupOrdersRoutes(app, ordersController);
  setupCheckoutRoutes(app, checkoutService);
}

function setupCheckoutRoutes(app: Hono, checkoutService: CheckoutService): void {
  // Checkout routes
  app.post('/api/v1/checkout', async (c) => {
    try {
      const cart = await c.req.json();
      const result = await checkoutService.processCheckout(cart);
      
      const statusCode = result.status === 'success' ? 200 : 400;
      return c.json(result, statusCode);
      
    } catch (error) {
      console.error('Checkout error:', error);
      return c.json({
        status: 'failed',
        message: 'Checkout failed: ' + (error as Error).message
      }, 500);
    }
  });

  app.post('/api/v1/checkout/summary', async (c) => {
    try {
      const cart = await c.req.json();
      const summary = await checkoutService.getCheckoutSummary(cart);
      
      return c.json(summary);
      
    } catch (error) {
      console.error('Checkout summary error:', error);
      return c.json({
        error: 'Failed to get checkout summary: ' + (error as Error).message
      }, 500);
    }
  });

  // Health check
  app.get('/api/v1/checkout/health', (c) => {
    return c.json({
      module: 'checkout',
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });
}