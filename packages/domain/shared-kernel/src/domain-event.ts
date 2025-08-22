export interface DomainEvent {
  readonly occurredOn: Date;
  readonly eventId: string;
  readonly eventType: string;
}

export abstract class BaseDomainEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventId: string;
  readonly eventType: string;

  constructor(eventType: string) {
    this.occurredOn = new Date();
    this.eventId = crypto.randomUUID();
    this.eventType = eventType;
  }
}
