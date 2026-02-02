import { type User, type InsertUser, type Feedback, type InsertFeedback } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getAllFeedback(): Promise<Feedback[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private feedbacks: Feedback[];
  private feedbackId: number;

  constructor() {
    this.users = new Map();
    this.feedbacks = [];
    this.feedbackId = 1;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const feedback: Feedback = {
      id: this.feedbackId++,
      name: insertFeedback.name,
      email: insertFeedback.email || null,
      message: insertFeedback.message,
      createdAt: new Date(),
    };
    this.feedbacks.push(feedback);
    return feedback;
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return this.feedbacks;
  }
}

export const storage = new MemStorage();
