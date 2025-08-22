import { ValueObject } from "./value-object";

interface EntityIdProps {
  value: string;
}

export abstract class EntityId extends ValueObject<EntityIdProps> {
  constructor(value?: string) {
    super({ value: value ?? crypto.randomUUID() });
  }

  get value(): string {
    return this.props.value;
  }

  toString(): string {
    return this.props.value;
  }
}
