import { AuditEvent } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class AuditLogger {
  private events: AuditEvent[] = [];

  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const fullEvent: AuditEvent = {
      ...event,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
    this.events.push(fullEvent);
    return fullEvent;
  }

  getEvents(): AuditEvent[] {
    return [...this.events];
  }

  getEventsForAgent(agentId: string): AuditEvent[] {
    return this.events.filter((e) => e.agentId === agentId);
  }

  getEventsForTransaction(transactionId: string): AuditEvent[] {
    return this.events.filter((e) => e.transactionId === transactionId);
  }

  getEventsByType(type: AuditEvent['eventType']): AuditEvent[] {
    return this.events.filter((e) => e.eventType === type);
  }
}
