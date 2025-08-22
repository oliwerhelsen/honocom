import { Container } from 'inversify';
import { Hono } from 'hono';

export interface ModuleMetadata {
  imports?: any[];
  providers?: any[];
  exports?: any[];
}

export interface ModuleDefinition {
  metadata: ModuleMetadata;
  container: Container;
}

const MODULE_METADATA = Symbol('MODULE_METADATA');

export function Module(metadata: ModuleMetadata): ClassDecorator {
  return function <T extends Function>(target: T): T {
    Reflect.defineMetadata(MODULE_METADATA, metadata, target);
    return target;
  };
}

export function getModuleMetadata(target: any): ModuleMetadata | undefined {
  return Reflect.getMetadata(MODULE_METADATA, target);
}