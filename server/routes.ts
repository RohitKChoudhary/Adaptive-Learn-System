import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import multer from "multer";
import OpenAI from "openai";

const upload = multer({ storage: multer.memoryStorage() });
const JWT_SECRET = process.env.SESSION_SECRET || "learnai_secret";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password: string, hash: string) {
  const [salt, key] = hash.split(":");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return key === derivedKey;
}

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(401);
    (req as any).user = user;
    next();
  });
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByEmail(input.email);
      if (existing) {
        return res.status(400).json({ message: "Email already exists" });
      }
      const user = await storage.createUser({
        email: input.email,
        password: hashPassword(input.password),
        fullName: input.full_name
      });
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      res.status(201).json({ access_token: token, user: { id: user.id, email: user.email, fullName: user.fullName } });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(input.email);
      if (!user || !verifyPassword(input.password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      res.json({ access_token: token, user: { id: user.id, email: user.email, fullName: user.fullName } });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.get(api.auth.me.path, authenticateToken, async (req, res) => {
    const user = await storage.getUser((req as any).user.id);
    if (!user) return res.sendStatus(404);
    res.json({ id: user.id, email: user.email, fullName: user.fullName });
  });

  const generateCourse = async (type: string, fileBuffer: Buffer, userId: string) => {
    const courseTitle = type === "FULL" ? "Advanced AI Concepts" : "Quick AI Revision";
    
    const course = await storage.createCourse({
      userId,
      title: courseTitle,
      courseType: type
    });

    for (let i = 1; i <= 3; i++) {
      await storage.createTopic({
        courseId: course.id,
        title: `Chapter ${i}: Fundamentals`,
        content: `## Fundamentals\n\nThis is the AI generated content for chapter ${i}. It covers the basics.\n\n### Key Takeaways\n- Point 1\n- Point 2\n\n\`\`\`javascript\nconsole.log("Hello AI");\n\`\`\``,
        orderIndex: i,
        aiSummary: `TL;DR: Chapter ${i} covers the core fundamentals necessary to understand the subsequent material.`,
        notebook: null
      });
    }

    const topics = await storage.getTopicsByCourse(course.id);
    return { ...course, topics };
  };

  app.post(api.courses.createFull.path, authenticateToken, upload.single('file'), async (req, res) => {
    const result = await generateCourse("FULL", req.file?.buffer || Buffer.from(""), (req as any).user.id);
    res.status(201).json(result);
  });

  app.post(api.courses.createOneShot.path, authenticateToken, upload.single('file'), async (req, res) => {
    const result = await generateCourse("ONESHOT", req.file?.buffer || Buffer.from(""), (req as any).user.id);
    res.status(201).json(result);
  });

  app.get(api.courses.listFull.path, authenticateToken, async (req, res) => {
    const courses = await storage.getCoursesByUser((req as any).user.id, "FULL");
    res.json(courses);
  });

  app.get(api.courses.listOneShot.path, authenticateToken, async (req, res) => {
    const courses = await storage.getCoursesByUser((req as any).user.id, "ONESHOT");
    res.json(courses);
  });

  app.get(api.courses.getSingle.path, authenticateToken, async (req, res) => {
    const course = await storage.getCourse(req.params.course_id);
    if (!course) return res.status(404).json({ message: "Not found" });
    const topics = await storage.getTopicsByCourse(course.id);
    res.json({ ...course, topics });
  });

  app.get(api.quiz.getChapterQuiz.path, authenticateToken, async (req, res) => {
    res.json({
      difficulty: "Medium",
      questions: [
        {
          question: "What is the primary function of a neural network?",
          options: ["Pattern recognition", "Data storage", "Web hosting", "Cooling servers"],
          correct_answer: "Pattern recognition",
          explanation: "Neural networks excel at recognizing patterns in data."
        },
        {
          question: "Which of the following is an activation function?",
          options: ["ReLU", "RAM", "CPU", "HTML"],
          correct_answer: "ReLU",
          explanation: "ReLU (Rectified Linear Unit) is a common activation function."
        },
        {
          question: "What does NLP stand for?",
          options: ["Natural Language Processing", "New Learning Protocol", "Neural Logic Program", "None of the above"],
          correct_answer: "Natural Language Processing",
          explanation: "NLP refers to Natural Language Processing."
        },
        {
          question: "Backpropagation is used for:",
          options: ["Training neural networks", "Building UI", "Running SQL", "Formatting text"],
          correct_answer: "Training neural networks",
          explanation: "Backpropagation calculates the gradient of the loss function."
        },
        {
          question: "A tensor is...",
          options: ["A mathematical object", "A type of database", "A web framework", "A monitor brand"],
          correct_answer: "A mathematical object",
          explanation: "Tensors are multi-dimensional arrays used in ML."
        }
      ]
    });
  });

  app.post(api.quiz.submit.path, authenticateToken, async (req, res) => {
    res.json({
      score: 4,
      total: 5,
      percentage: 80,
      next_difficulty: "Hard",
      message: "Excellent! Moving to harder concepts."
    });
  });

  app.get(api.quiz.getFullTest.path, authenticateToken, async (req, res) => {
    res.json(Array(15).fill({
        question: "Sample Test Question",
        options: ["A", "B", "C", "D"],
        correct_answer: "A",
        explanation: "Because A is the correct placeholder answer."
      }));
  });

  app.get(api.quiz.getNotebook.path, authenticateToken, async (req, res) => {
    res.json({ cells: [
      { type: "markdown", content: "### Interactive Notebook" },
      { type: "code", content: "print('Welcome to the interactive coding environment!');" }
    ] });
  });

  app.get(api.quiz.getProgress.path, authenticateToken, async (req, res) => {
    const progress = await storage.getCourseProgress((req as any).user.id, req.params.course_id);
    res.json(progress);
  });

  app.post(api.comprehension.docUpload.path, authenticateToken, upload.single('file'), async (req, res) => {
    res.json({ session_id: crypto.randomUUID(), text: "Extracted document text from uploaded file..." });
  });

  app.post(api.comprehension.docAsk.path, authenticateToken, async (req, res) => {
    res.json({ answer: "Based on the document, here is your AI-generated answer. It looks like the concept is heavily reliant on linear algebra." });
  });

  app.post(api.comprehension.videoExtract.path, authenticateToken, async (req, res) => {
    res.json({ session_id: crypto.randomUUID(), text: "Extracted video transcript from YouTube..." });
  });

  app.post(api.comprehension.videoAsk.path, authenticateToken, async (req, res) => {
    res.json({ answer: "According to the video transcript, the speaker emphasizes the importance of data quality." });
  });

  return httpServer;
}
