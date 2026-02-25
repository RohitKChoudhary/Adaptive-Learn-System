import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  courseType: text("course_type").notNull(), // "FULL" or "ONESHOT"
  createdAt: timestamp("created_at").defaultNow(),
});

export const topics = pgTable("topics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: uuid("course_id").references(() => courses.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  orderIndex: integer("order_index").notNull(),
  aiSummary: text("ai_summary").notNull(),
  notebook: jsonb("notebook"), // { cells: [{ type: "markdown"|"code", content: "..." }] }
});

export const progress = pgTable("progress", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  topicId: uuid("topic_id").references(() => topics.id).notNull(),
  courseId: uuid("course_id").references(() => courses.id).notNull(), // Denormalized for easy lookup
  difficulty: text("difficulty").notNull().default("Easy"), // Easy, Medium, Hard
  isCompleted: boolean("is_completed").default(false),
  score: integer("score").default(0),
  totalQuestions: integer("total_questions").default(0),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  progress: many(progress),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  user: one(users, { fields: [courses.userId], references: [users.id] }),
  topics: many(topics),
  progress: many(progress),
}));

export const topicsRelations = relations(topics, ({ one }) => ({
  course: one(courses, { fields: [topics.courseId], references: [courses.id] }),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true });
export const insertTopicSchema = createInsertSchema(topics).omit({ id: true });
export const insertProgressSchema = createInsertSchema(progress).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Course = typeof courses.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type Progress = typeof progress.$inferSelect;

export type CourseWithTopics = Course & { topics: Topic[] };

export type AuthResponse = {
  accessToken: string;
  user: Omit<User, 'password'>;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
};

export type QuizResponse = {
  difficulty: string;
  questions: QuizQuestion[];
};

export type QuizSubmitRequest = {
  topic_id: string;
  answers: string[];
  correct_answers: string[];
};

export type QuizSubmitResponse = {
  score: number;
  total: number;
  percentage: number;
  next_difficulty: string;
  message: string;
};

export type DocComprehensionResponse = {
  session_id: string;
  text: string;
};

export type AskRequest = {
  question: string;
  session_id: string;
  text: string;
};

export type AskResponse = {
  answer: string;
};

export type VideoExtractRequest = {
  url: string;
};
