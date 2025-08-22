import { injectable } from 'inversify';
import { EventHandler, DomainEvent } from './event-bus';

@injectable()
export abstract class BaseEventHandler implements EventHandler {
  abstract handle(event: DomainEvent): Promise<void>;

  protected log(message: string, event: DomainEvent): void {
    console.log(`[${this.constructor.name}] ${message}`, {
      eventType: event.eventType,
      aggregateId: event.aggregateId,
      timestamp: event.timestamp
    });
  }

  protected logError(message: string, event: DomainEvent, error: any): void {
    console.error(`[${this.constructor.name}] ${message}`, {
      eventType: event.eventType,
      aggregateId: event.aggregateId,
      error: error.message || error
    });
  }
}