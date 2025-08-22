import { Container } from 'inversify';
import { Hono } from 'hono';
import { BaseModule } from './base-module';

export class ModuleRegistry {
  private modules: Map<string, BaseModule> = new Map();
  private globalContainer: Container = new Container();

  registerModule(name: string, moduleClass: new () => BaseModule): void {
    const moduleInstance = new moduleClass();
    this.modules.set(name, moduleInstance);
    
    // Merge module container with global container
    this.mergeContainers(moduleInstance.getContainer());
  }

  getModule(name: string): BaseModule | undefined {
    return this.modules.get(name);
  }

  getAllModules(): BaseModule[] {
    return Array.from(this.modules.values());
  }

  getGlobalContainer(): Container {
    return this.globalContainer;
  }

  setupRoutes(app: Hono): void {
    this.modules.forEach(module => {
      module.registerRoutes(app);
    });
  }

  private mergeContainers(moduleContainer: Container): void {
    // This is a simplified merge - in production you might want more sophisticated merging
    // For now, we'll copy bindings from module container to global container
    // Note: InversifyJS doesn't provide a direct way to merge containers,
    // so this is a conceptual implementation
  }
}