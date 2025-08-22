const CONTROLLER_METADATA = Symbol('CONTROLLER_METADATA');

export interface ControllerMetadata {
  path: string;
}

export function Controller(path: string = ''): ClassDecorator {
  return function <T extends Function>(target: T): T {
    Reflect.defineMetadata(CONTROLLER_METADATA, { path }, target);
    return target;
  };
}

export function getControllerMetadata(target: any): ControllerMetadata | undefined {
  return Reflect.getMetadata(CONTROLLER_METADATA, target);
}