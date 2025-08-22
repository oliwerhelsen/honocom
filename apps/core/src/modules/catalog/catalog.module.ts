import { Hono } from 'hono';
import { Module } from '../../shared/decorators/module.decorator';
import { BaseModule } from '../../shared/module/base-module';
import { CatalogService } from './services/catalog.service';
import { CatalogController } from './controllers/catalog.controller';
import { setupCatalogRoutes } from './routes/catalog.routes';

@Module({
  providers: [CatalogService],
  controllers: [CatalogController],
  exports: [CatalogService],
})
export class CatalogModule extends BaseModule {
  constructor() {
    super();
    console.log('📦 CatalogModule initialized');
  }

  registerRoutes(app: Hono): void {
    const catalogController = this.container.get('CatalogController');
    setupCatalogRoutes(app, catalogController);
  }
}