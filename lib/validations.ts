import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
});

export const loginWithEmployeeIdSchema = z.object({
  employeeId: z.string().trim().toUpperCase().min(1, "Enter your Employee ID."),
  password: z.string().min(8),
});

export const courseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(3000),
  category: z.string().min(2).max(80),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  estimatedMinutes: z.coerce.number().int().min(1).max(100000),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export const moduleSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  order: z.coerce.number().int().min(1),
});

export const lessonSchema = z.object({
  moduleId: z.string().min(1),
  title: z.string().min(2).max(160),
  type: z.enum(["TEXT", "YOUTUBE", "VIDEO", "PDF", "LINK", "ASSIGNMENT", "QUIZ"]),
  content: z.string().max(20000).optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  externalUrl: z.string().url().optional().or(z.literal("")),
  order: z.coerce.number().int().min(1),
  estimatedMinutes: z.coerce.number().int().min(1).max(10000),
  completionRequired: z.coerce.boolean(),
  videoStartTime: z.coerce.number().int().min(0).optional(),
  videoEndTime: z.coerce.number().int().min(0).optional(),
});
