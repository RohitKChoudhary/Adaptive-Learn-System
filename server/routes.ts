import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import multer from "multer";
import Groq from "groq-sdk";
import mammoth from "mammoth";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const upload = multer({ storage: multer.memoryStorage() });
const JWT_SECRET = process.env.SESSION_SECRET || "learnai_secret";

const groq = new Groq({
  apiKey: "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",
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
    const syllabus = fileBuffer.toString() || "Artificial Intelligence Basics";
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a professional course creator. Based on the syllabus provided, generate a structured course.
          Return a JSON object with:
          {
            "title": "Course Title",
            "topics": [
              {
                "title": "Topic Title",
                "content": "Detailed markdown content",
                "aiSummary": "2 sentence summary",
                "notebook": null
              }
            ]
          }
          Generate exactly 3 topics. For "FULL" course, make content long and detailed. For "ONESHOT", make it a concise quick revision.`,
        },
        {
          role: "user",
          content: `Syllabus: ${syllabus}\nCourse Type: ${type}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content!);
    
    const course = await storage.createCourse({
      userId,
      title: result.title,
      courseType: type
    });

    for (let i = 0; i < result.topics.length; i++) {
      const topic = result.topics[i];
      await storage.createTopic({
        courseId: course.id,
        title: topic.title,
        content: topic.content,
        orderIndex: i + 1,
        aiSummary: topic.aiSummary,
        notebook: topic.notebook
      });
    }

    const topics = await storage.getTopicsByCourse(course.id);
    return { ...course, topics };
  };

  app.post(api.courses.createFull.path, authenticateToken, upload.single('file'), async (req, res) => {
    try {
      const result = await generateCourse("FULL", req.file?.buffer || Buffer.from(""), (req as any).user.id);
      res.status(201).json(result);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: "AI generation failed" });
    }
  });

  app.post(api.courses.createOneShot.path, authenticateToken, upload.single('file'), async (req, res) => {
    try {
      const result = await generateCourse("ONESHOT", req.file?.buffer || Buffer.from(""), (req as any).user.id);
      res.status(201).json(result);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: "AI generation failed" });
    }
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
    const topicId = req.params.topic_id;
    const topic = await storage.getTopic(topicId);
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Generate a quiz for the following content. Return JSON:
          {
            "difficulty": "Medium",
            "questions": [
              {
                "question": "...",
                "options": ["A", "B", "C", "D"],
                "correct_answer": "...",
                "explanation": "..."
              }
            ]
          }
          Generate 5 questions.`,
        },
        {
          role: "user",
          content: topic?.content || "AI Basics",
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    res.json(JSON.parse(completion.choices[0].message.content!));
  });

  app.post(api.quiz.submit.path, authenticateToken, async (req, res) => {
    const { answers, correct_answers } = req.body;
    let score = 0;
    answers.forEach((ans: string, i: number) => {
      if (ans === correct_answers[i]) score++;
    });
    
    const percentage = (score / answers.length) * 100;
    let next_difficulty = "Medium";
    if (percentage >= 80) next_difficulty = "Hard";
    else if (percentage < 50) next_difficulty = "Easy";

    res.json({
      score,
      total: answers.length,
      percentage,
      next_difficulty,
      message: percentage >= 80 ? "Excellent work!" : "Keep practicing!"
    });
  });

  app.get(api.quiz.getFullTest.path, authenticateToken, async (req, res) => {
    const topicId = req.params.topic_id;
    const topic = await storage.getTopic(topicId);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Generate a 15-question mixed difficulty test. Return JSON array of questions.`,
        },
        {
          role: "user",
          content: topic?.content || "AI Basics",
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content!);
    res.json(result.questions || result);
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
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      
      let text = "";
      const mimetype = req.file.mimetype;
      
      if (mimetype === "application/pdf") {
        const data = await pdf(req.file.buffer);
        text = data.text;
      } else if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const data = await mammoth.extractRawText({ buffer: req.file.buffer });
        text = data.value;
      } else {
        text = req.file.buffer.toString();
      }

      res.json({ session_id: crypto.randomUUID(), text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: "Failed to extract document text" });
    }
  });

  app.post(api.comprehension.docAsk.path, authenticateToken, async (req, res) => {
    const { question, text } = req.body;
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant. Answer the user's question based ONLY on the provided document text. If the answer is not in the text, say you don't know.",
        },
        {
          role: "user",
          content: `Document Content: ${text}\n\nQuestion: ${question}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    res.json({ answer: completion.choices[0].message.content });
  });

  app.post(api.comprehension.videoExtract.path, authenticateToken, async (req, res) => {
    try {
      const { url } = req.body;
      
      // Basic URL validation
      if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
        return res.status(400).json({ message: "Invalid YouTube URL" });
      }

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert educational content creator and video analyst. Your task is to generate a highly detailed, accurate, and structured transcript for an educational YouTube video based on its URL and any implicit context. The transcript should include timestamps, speaker markers, and clear sections. If the URL suggests a specific topic (e.g., 'React Tutorial', 'Linear Algebra'), ensure the technical content is deep and accurate.",
          },
          {
            role: "user",
            content: `Please extract and generate a comprehensive transcript for this educational video: ${url}`,
          },
        ],
        model: "llama-3.3-70b-versatile",
      });

      res.json({ session_id: crypto.randomUUID(), text: completion.choices[0].message.content });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: "Failed to extract video transcript" });
    }
  });

  app.post(api.comprehension.videoAsk.path, authenticateToken, async (req, res) => {
    const { question, text } = req.body;
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant. Answer the user's question based ONLY on the provided video transcript. If the answer is not in the transcript, say you don't know.",
        },
        {
          role: "user",
          content: `Video Transcript: ${text}\n\nQuestion: ${question}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    res.json({ answer: completion.choices[0].message.content });
  });

  return httpServer;
}
