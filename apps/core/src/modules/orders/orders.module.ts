import { Hono } from 'hono';
import { Module } from '../../shared/decorators/module.decorator';
import { BaseModule } from '../../shared/module/base-module';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { setupOrdersRoutes } from './routes/orders.routes';

@Module({
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule extends BaseModule {
  constructor() {
    super();
    console.log('📦 OrdersModule initialized');
  }

  registerRoutes(app: Hono): void {
    const ordersController = this.container.get('OrdersController');
    setupOrdersRoutes(app, ordersController);
  }
}