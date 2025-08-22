import { CatalogModule } from '../modules/catalog/catalog.module';
import { OrdersModule } from '../modules/orders/orders.module';
import { CheckoutModule } from '../modules/checkout/checkout.module';

export interface ModuleConfig {
  name: string;
  module: new () => any;
  enabled: boolean;
  dependencies?: string[];
}

export const moduleConfigurations: ModuleConfig[] = [
  {
    name: 'catalog',
    module: CatalogModule,
    enabled: true,
    dependencies: []
  },
  {
    name: 'orders',
    module: OrdersModule,
    enabled: true,
    dependencies: []
  },
  {
    name: 'checkout',
    module: CheckoutModule,
    enabled: true,
    dependencies: ['catalog', 'orders']
  }
];

export function getEnabledModules(): ModuleConfig[] {
  return moduleConfigurations.filter(config => config.enabled);
}

export function validateModuleDependencies(configs: ModuleConfig[]): void {
  const moduleNames = new Set(configs.map(config => config.name));

  for (const config of configs) {
    if (config.dependencies) {
      for (const dependency of config.dependencies) {
        if (!moduleNames.has(dependency)) {
          throw new Error(
            `Module '${config.name}' depends on '${dependency}', but '${dependency}' is not enabled`
          );
        }
      }
    }
  }
}