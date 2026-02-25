import { db } from "./db";
import {
  users, courses, topics, progress,
  type User, type InsertUser, type Course, type InsertCourse,
  type Topic, type InsertTopic, type Progress, type InsertProgress
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Course
  createCourse(course: InsertCourse): Promise<Course>;
  getCoursesByUser(userId: string, courseType: string): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;

  // Topic
  createTopic(topic: InsertTopic): Promise<Topic>;
  getTopicsByCourse(courseId: string): Promise<Topic[]>;
  getTopic(id: string): Promise<Topic | undefined>;

  // Progress
  getProgress(userId: string, topicId: string): Promise<Progress | undefined>;
  getCourseProgress(userId: string, courseId: string): Promise<Progress[]>;
  upsertProgress(p: InsertProgress): Promise<Progress>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [c] = await db.insert(courses).values(course).returning();
    return c;
  }

  async getCoursesByUser(userId: string, courseType: string): Promise<Course[]> {
    return await db.select().from(courses).where(and(eq(courses.userId, userId), eq(courses.courseType, courseType)));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [c] = await db.select().from(courses).where(eq(courses.id, id));
    return c;
  }

  async createTopic(topic: InsertTopic): Promise<Topic> {
    const [t] = await db.insert(topics).values(topic).returning();
    return t;
  }

  async getTopicsByCourse(courseId: string): Promise<Topic[]> {
    return await db.select().from(topics).where(eq(topics.courseId, courseId)).orderBy(topics.orderIndex);
  }

  async getTopic(id: string): Promise<Topic | undefined> {
    const [t] = await db.select().from(topics).where(eq(topics.id, id));
    return t;
  }

  async getProgress(userId: string, topicId: string): Promise<Progress | undefined> {
    const [p] = await db.select().from(progress).where(and(eq(progress.userId, userId), eq(progress.topicId, topicId)));
    return p;
  }

  async getCourseProgress(userId: string, courseId: string): Promise<Progress[]> {
    return await db.select().from(progress).where(and(eq(progress.userId, userId), eq(progress.courseId, courseId)));
  }

  async upsertProgress(p: InsertProgress): Promise<Progress> {
    const existing = await this.getProgress(p.userId, p.topicId);
    if (existing) {
      const [updated] = await db.update(progress).set(p).where(eq(progress.id, existing.id)).returning();
      return updated;
    }
    const [inserted] = await db.insert(progress).values(p).returning();
    return inserted;
  }
}

export const storage = new DatabaseStorage();
