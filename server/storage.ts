import { type Event, type InsertEvent, type ContactMessage, type InsertContact } from "@shared/schema";

export interface IStorage {
  // Events
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // Contact Messages
  createContactMessage(message: InsertContact): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
}

export class MemStorage implements IStorage {
  private events: Map<number, Event>;
  private contactMessages: Map<number, ContactMessage>;
  private eventId: number;
  private messageId: number;

  constructor() {
    this.events = new Map();
    this.contactMessages = new Map();
    this.eventId = 1;
    this.messageId = 1;
  }

  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    const newEvent = { ...event, id };
    this.events.set(id, newEvent);
    return newEvent;
  }

  async createContactMessage(message: InsertContact): Promise<ContactMessage> {
    const id = this.messageId++;
    const newMessage = { ...message, id, createdAt: new Date() };
    this.contactMessages.set(id, newMessage);
    return newMessage;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values());
  }
}

export const storage = new MemStorage();
