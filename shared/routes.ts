import { z } from 'zod';
import { insertUserSchema, users, courses, topics, progress } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: z.object({ email: z.string().email(), password: z.string().min(6), full_name: z.string() }),
      responses: {
        201: z.object({ access_token: z.string(), user: z.any() }),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({ email: z.string(), password: z.string() }),
      responses: {
        200: z.object({ access_token: z.string(), user: z.any() }),
        401: errorSchemas.unauthorized,
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.any(),
        401: errorSchemas.unauthorized,
      },
    }
  },
  courses: {
    createFull: {
      method: 'POST' as const,
      path: '/api/fullcourse/create' as const,
      // multipart form data
      responses: {
        201: z.any(), // Returns CourseWithTopics
        400: errorSchemas.validation,
      }
    },
    createOneShot: {
      method: 'POST' as const,
      path: '/api/oneshot/create' as const,
      // multipart form data
      responses: {
        201: z.any(), // Returns CourseWithTopics
        400: errorSchemas.validation,
      }
    },
    listFull: {
      method: 'GET' as const,
      path: '/api/fullcourse' as const,
      responses: {
        200: z.array(z.any()), // Array of Courses
      }
    },
    listOneShot: {
      method: 'GET' as const,
      path: '/api/oneshot' as const,
      responses: {
        200: z.array(z.any()), // Array of Courses
      }
    },
    getSingle: {
      method: 'GET' as const,
      path: '/api/fullcourse/:course_id' as const,
      responses: {
        200: z.any(), // CourseWithTopics
        404: errorSchemas.notFound,
      }
    }
  },
  quiz: {
    getChapterQuiz: {
      method: 'GET' as const,
      path: '/api/quiz/chapter/:topic_id' as const,
      responses: {
        200: z.any(), // QuizResponse
        404: errorSchemas.notFound,
      }
    },
    submit: {
      method: 'POST' as const,
      path: '/api/quiz/submit' as const,
      input: z.object({
        topic_id: z.string(),
        answers: z.array(z.string()),
        correct_answers: z.array(z.string()),
      }),
      responses: {
        200: z.any(), // QuizSubmitResponse
      }
    },
    getFullTest: {
      method: 'GET' as const,
      path: '/api/quiz/full-test/:topic_id' as const,
      responses: {
        200: z.array(z.any()), // Array of questions
      }
    },
    getNotebook: {
      method: 'GET' as const,
      path: '/api/quiz/notebook/:topic_id' as const,
      responses: {
        200: z.any(), // Notebook cells
      }
    },
    getProgress: {
      method: 'GET' as const,
      path: '/api/quiz/progress/:course_id' as const,
      responses: {
        200: z.array(z.any()), // Progress entries
      }
    }
  },
  comprehension: {
    docUpload: {
      method: 'POST' as const,
      path: '/api/doc-comprehension/upload' as const,
      // multipart
      responses: { 200: z.any() } // DocComprehensionResponse
    },
    docAsk: {
      method: 'POST' as const,
      path: '/api/doc-comprehension/ask' as const,
      input: z.object({ question: z.string(), session_id: z.string(), text: z.string() }),
      responses: { 200: z.any() } // AskResponse
    },
    videoExtract: {
      method: 'POST' as const,
      path: '/api/video-comprehension/extract' as const,
      input: z.object({ url: z.string() }),
      responses: { 200: z.any() }
    },
    videoAsk: {
      method: 'POST' as const,
      path: '/api/video-comprehension/ask' as const,
      input: z.object({ question: z.string(), session_id: z.string(), text: z.string() }),
      responses: { 200: z.any() }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
