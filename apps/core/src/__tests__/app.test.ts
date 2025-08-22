import 'reflect-metadata';
import { AppModule } from '../app.module';

describe('AppModule', () => {
  let appModule: AppModule;
  
  beforeEach(() => {
    appModule = new AppModule();
  });

  describe('Application Initialization', () => {
    it('should initialize successfully', () => {
      expect(appModule).toBeDefined();
      expect(appModule.getApp()).toBeDefined();
    });

    it('should have module registry', () => {
      const moduleRegistry = appModule.getModuleRegistry();
      expect(moduleRegistry).toBeDefined();
      
      const modules = moduleRegistry.getAllModules();
      expect(modules).toHaveLength(3); // catalog, orders, checkout
    });

    it('should register all expected modules', () => {
      const moduleRegistry = appModule.getModuleRegistry();
      const moduleNames = moduleRegistry.getAllModules().map(m => m.constructor.name);
      
      expect(moduleNames).toContain('CatalogModule');
      expect(moduleNames).toContain('OrdersModule'); 
      expect(moduleNames).toContain('CheckoutModule');
    });
  });

  describe('API Endpoints', () => {
    it('should respond to root endpoint', async () => {
      const app = appModule.getApp();
      const res = await app.request('/');
      
      expect(res.status).toBe(200);
      
      const json = await res.json();
      expect(json.name).toBe('HonoCom Core API');
      expect(json.version).toBe('1.0.0');
      expect(json.modules).toContain('CatalogModule');
      expect(json.modules).toContain('OrdersModule');
      expect(json.modules).toContain('CheckoutModule');
    });

    it('should respond to health endpoint', async () => {
      const app = appModule.getApp();
      const res = await app.request('/health');
      
      expect(res.status).toBe(200);
      
      const json = await res.json();
      expect(json.status).toBe('healthy');
      expect(json.modules).toBeDefined();
    });

    it('should respond to ready endpoint', async () => {
      const app = appModule.getApp();
      const res = await app.request('/ready');
      
      expect(res.status).toBe(200);
      
      const json = await res.json();
      expect(json.status).toBe('ready');
      expect(json.modules).toBeDefined();
    });
  });
});