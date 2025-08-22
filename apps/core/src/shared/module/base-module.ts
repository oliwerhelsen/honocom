import { Container } from 'inversify';
import { Hono } from 'hono';
import { getModuleMetadata, ModuleMetadata } from '../decorators/module.decorator';

export abstract class BaseModule {
  protected container: Container;
  protected metadata: ModuleMetadata;

  constructor() {
    this.container = new Container();
    this.metadata = getModuleMetadata(this.constructor) || {};
    this.setupModule();
  }

  private setupModule(): void {
    // Bind providers to container
    this.metadata.providers?.forEach(provider => {
      const serviceName = provider.name;
      this.container.bind(serviceName).to(provider).inTransientScope();
    });

    // Bind controllers to container
    this.metadata.controllers?.forEach(controller => {
      const controllerName = controller.name;
      this.container.bind(controllerName).to(controller).inTransientScope();
    });
  }

  getContainer(): Container {
    return this.container;
  }

  getMetadata(): ModuleMetadata {
    return this.metadata;
  }

  // Method to register routes with Hono app
  registerRoutes(app: Hono): void {
    if (this.metadata.routes) {
      this.metadata.routes(app);
    }
  }

  // Method to get exported providers for other modules
  getExports(): any[] {
    return this.metadata.exports || [];
  }
}