import { injectable } from 'inversify';

export interface DomainEvent {
  eventType: string;
  aggregateId: string;
  payload: any;
  timestamp: Date;
  version: number;
}

export interface EventHandler {
  handle(event: DomainEvent): Promise<void>;
}

@injectable()
export class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    
    this.handlers.get(eventType)!.push(handler);
    console.log(`📡 Subscribed handler for event: ${eventType}`);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];
    
    console.log(`📤 Publishing event: ${event.eventType} for aggregate: ${event.aggregateId}`);
    
    // Execute all handlers in parallel
    const promises = handlers.map(handler => 
      this.executeHandler(handler, event)
    );
    
    await Promise.all(promises);
  }

  private async executeHandler(handler: EventHandler, event: DomainEvent): Promise<void> {
    try {
      await handler.handle(event);
      console.log(`✅ Event handler executed successfully for: ${event.eventType}`);
    } catch (error) {
      console.error(`❌ Event handler failed for: ${event.eventType}`, error);
      // In production, you might want to implement retry logic or dead letter queue
    }
  }

  getSubscribedEvents(): string[] {
    return Array.from(this.handlers.keys());
  }

  clearHandlers(eventType?: string): void {
    if (eventType) {
      this.handlers.delete(eventType);
    } else {
      this.handlers.clear();
    }
  }
}