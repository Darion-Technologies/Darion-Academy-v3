"use server";

import { z } from "zod";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { courseSchema, lessonSchema, moduleSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { uploadPrivateFile } from "@/lib/storage";
import { resolveAvailableOrder } from "@/lib/order";
import { getYouTubeVideoId } from "@/lib/youtube";
import { sendPushNotification } from "@/lib/push";
import { Prisma, type UserRole } from "@/generated/prisma";

export type ActionState = { error?: string; success?: string; courseId?: string };

export async function inviteUserAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireRole("ADMIN");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "");
  const department = String(formData.get("department") ?? "").trim() || null;
  const employeeId = String(formData.get("employeeId") ?? "").trim() || null;
  if (!email.includes("@") || name.length < 2 || !department || !["ADMIN", "MENTOR", "EMPLOYEE", "INTERN"].includes(role)) return { error: "Complete all required user fields." };
  if ((role === "EMPLOYEE" || role === "INTERN") && !employeeId) return { error: "Employee ID is required for learners." };
  const existingProfile = await prisma.user.findFirst({
    where: { OR: [{ email }, ...(employeeId ? [{ employeeId }] : [])] },
    select: { id: true },
  });
  if (existingProfile) return { error: "A profile with this email or employee ID already exists." };
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { name, role },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/settings`,
  });
  if (error || !data.user) return { error: error?.message ?? "Could not invite user." };
  try {
    await prisma.$transaction([
      prisma.user.create({ data: { id: data.user.id, email, employeeId, name, role: role as UserRole, department } }),
      prisma.activityLog.create({ data: { actorId: admin.id, action: "Invited user", entityType: "User", entityId: data.user.id, metadata: { email, role } } }),
    ]);
  } catch (profileError) {
    await supabase.auth.admin.deleteUser(data.user.id);
    return { error: profileError instanceof Error ? profileError.message : "The profile could not be created. The invitation was cancelled." };
  }
  revalidatePath("/admin/users");
  return { success: `Invitation sent to ${email}.` };
}

export async function updateUserAccessAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as UserRole;
  const active = formData.get("active") === "true";
  if (!["ADMIN", "MENTOR", "EMPLOYEE", "INTERN"].includes(role)) throw new Error("Invalid role.");
  if (userId === admin.id && (!active || role !== "ADMIN")) throw new Error("You cannot remove your own administrator access.");
  const profile = await prisma.user.update({ where: { id: userId }, data: { role, active } });
  const supabase = createAdminClient();
  await supabase.auth.admin.updateUserById(userId, {
    ban_duration: active ? "none" : "876000h",
    user_metadata: { name: profile.name, role },
  });
  await prisma.activityLog.create({
    data: { actorId: admin.id, action: active ? "Updated user access" : "Deactivated user", entityType: "User", entityId: userId, metadata: { role, active } },
  });
  revalidatePath("/admin/users");
}

export async function saveCourseAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireRole("ADMIN");
  const parsed = courseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid course." };
  const { id, ...data } = parsed.data;
  const slug = slugify(data.title);
  try {
    const course = id
      ? await prisma.course.update({ where: { id }, data: { ...data, slug } })
      : await prisma.course.create({ data: { ...data, slug } });
    await prisma.activityLog.create({ data: { actorId: admin.id, action: id ? "Updated course" : "Created course", entityType: "Course", entityId: course.id } });
    revalidatePath("/admin/courses");
    return { success: "Course saved.", courseId: course.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "A course with this title already exists." };
    }
    if (
      error instanceof Error &&
      ["The selected file exceeds the allowed size.", "This file type is not allowed."].includes(error.message)
    ) {
      return { error: error.message };
    }
    return { error: "The course could not be saved." };
  }
}

export async function deleteCourseAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const courseId = String(formData.get("courseId") ?? "");
  const enrollmentCount = await prisma.enrollment.count({ where: { courseId } });
  if (enrollmentCount > 0) {
    await prisma.course.update({ where: { id: courseId }, data: { status: "ARCHIVED" } });
    await prisma.activityLog.create({ data: { actorId: admin.id, action: "Archived enrolled course", entityType: "Course", entityId: courseId } });
  } else {
    await prisma.course.delete({ where: { id: courseId } });
    await prisma.activityLog.create({ data: { actorId: admin.id, action: "Deleted course", entityType: "Course", entityId: courseId } });
  }
  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

export async function forceDeleteCourseAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const courseId = String(formData.get("courseId") ?? "");
  await prisma.course.delete({ where: { id: courseId } });
  await prisma.activityLog.create({ data: { actorId: admin.id, action: "Force deleted course", entityType: "Course", entityId: courseId } });
  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

export async function createModuleAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const parsed = moduleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
  const existing = await prisma.module.findMany({
    where: { courseId: parsed.data.courseId },
    select: { order: true },
  });
  const courseModule = await prisma.module.create({
    data: {
      ...parsed.data,
      order: resolveAvailableOrder(parsed.data.order, existing.map((item) => item.order)),
    },
  });
  await prisma.activityLog.create({
    data: { actorId: admin.id, action: "Created module", entityType: "Module", entityId: courseModule.id },
  });
  revalidatePath(`/admin/courses/${parsed.data.courseId}`);
}

export async function updateModuleAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const current = await prisma.module.findUniqueOrThrow({ where: { id } });
  const parsed = moduleSchema.safeParse({ ...Object.fromEntries(formData), courseId: current.courseId });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
  await prisma.module.update({
    where: { id },
    data: { title: parsed.data.title, description: parsed.data.description, order: parsed.data.order },
  });
  await prisma.activityLog.create({ data: { actorId: admin.id, action: "Updated module", entityType: "Module", entityId: id } });
  revalidatePath(`/admin/courses/${current.courseId}`);
}

export async function deleteModuleAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const courseModule = await prisma.module.findUniqueOrThrow({ where: { id } });
  await prisma.module.delete({ where: { id } });
  await prisma.activityLog.create({ data: { actorId: admin.id, action: "Deleted module", entityType: "Module", entityId: id } });
  revalidatePath(`/admin/courses/${courseModule.courseId}`);
}

export async function createLessonAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const raw = Object.fromEntries(formData);
  const parsed = lessonSchema.safeParse({ ...raw, completionRequired: formData.get("completionRequired") === "on" });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
  if (parsed.data.type === "YOUTUBE" && (!parsed.data.videoUrl || !getYouTubeVideoId(parsed.data.videoUrl))) {
    throw new Error("Enter a valid YouTube watch, short, live, or youtu.be link.");
  }
  const existing = await prisma.lesson.findMany({
    where: { moduleId: parsed.data.moduleId },
    select: { order: true },
  });
  const lesson = await prisma.lesson.create({
    data: {
      ...parsed.data,
      order: resolveAvailableOrder(parsed.data.order, existing.map((item) => item.order)),
      videoUrl: parsed.data.videoUrl || null,
      externalUrl: parsed.data.externalUrl || null,
      videoStartTime: parsed.data.videoStartTime || null,
      videoEndTime: parsed.data.videoEndTime || null,
    },
  });
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    const fileUrl = await uploadPrivateFile("lesson-files", `${lesson.id}/${Date.now()}-${file.name}`, file);
    await prisma.lesson.update({ where: { id: lesson.id }, data: { fileUrl } });
  }
  if (lesson.type === "ASSIGNMENT") await prisma.assignment.create({ data: { lessonId: lesson.id, instructions: parsed.data.content || "Complete the assigned task." } });
  if (lesson.type === "QUIZ") await prisma.quiz.create({ data: { lessonId: lesson.id, title: lesson.title, passMark: 70 } });
  await prisma.activityLog.create({
    data: { actorId: admin.id, action: "Created lesson", entityType: "Lesson", entityId: lesson.id },
  });
  const courseModule = await prisma.module.findUniqueOrThrow({ where: { id: parsed.data.moduleId } });
  revalidatePath(`/admin/courses/${courseModule.courseId}`);
}

export async function updateLessonAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const current = await prisma.lesson.findUniqueOrThrow({ where: { id }, include: { module: true } });
  const parsed = lessonSchema.safeParse({
    ...Object.fromEntries(formData),
    moduleId: current.moduleId,
    completionRequired: formData.get("completionRequired") === "on",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
  if (parsed.data.type === "YOUTUBE" && (!parsed.data.videoUrl || !getYouTubeVideoId(parsed.data.videoUrl))) {
    throw new Error("Enter a valid YouTube URL.");
  }
  await prisma.$transaction(async (tx) => {
    await tx.lesson.update({
      where: { id },
      data: {
        title: parsed.data.title,
        type: parsed.data.type,
        content: parsed.data.content || null,
        videoUrl: parsed.data.videoUrl || null,
        externalUrl: parsed.data.externalUrl || null,
        order: parsed.data.order,
        estimatedMinutes: parsed.data.estimatedMinutes,
        completionRequired: parsed.data.completionRequired,
        videoStartTime: parsed.data.videoStartTime || null,
        videoEndTime: parsed.data.videoEndTime || null,
      },
    });
    if (parsed.data.type === "ASSIGNMENT") {
      await tx.assignment.upsert({
        where: { lessonId: id },
        update: { instructions: parsed.data.content || "Complete the assigned task." },
        create: { lessonId: id, instructions: parsed.data.content || "Complete the assigned task." },
      });
    } else {
      await tx.assignment.deleteMany({ where: { lessonId: id } });
    }
    if (parsed.data.type === "QUIZ") {
      await tx.quiz.upsert({
        where: { lessonId: id },
        update: { title: parsed.data.title },
        create: { lessonId: id, title: parsed.data.title, passMark: 70 },
      });
    } else {
      await tx.quiz.deleteMany({ where: { lessonId: id } });
    }
  });
  await prisma.activityLog.create({ data: { actorId: admin.id, action: "Updated lesson", entityType: "Lesson", entityId: id } });
  revalidatePath(`/admin/courses/${current.module.courseId}`);
}

export async function deleteLessonAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const lesson = await prisma.lesson.findUniqueOrThrow({ where: { id }, include: { module: true } });
  await prisma.lesson.delete({ where: { id } });
  await prisma.activityLog.create({ data: { actorId: admin.id, action: "Deleted lesson", entityType: "Lesson", entityId: id } });
  revalidatePath(`/admin/courses/${lesson.module.courseId}`);
}

export async function assignCourseAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const courseId = String(formData.get("courseId") ?? "");
  const learnerId = String(formData.get("learnerId") ?? "");
  const mentorId = String(formData.get("mentorId") ?? "") || null;
  
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new Error("Course not found");

  let deadlineAt = null;
  if (course.deadlineDays) {
    deadlineAt = new Date();
    deadlineAt.setDate(deadlineAt.getDate() + course.deadlineDays);
  }

  const enrollment = await prisma.enrollment.upsert({
    where: { learnerId_courseId: { learnerId, courseId } },
    update: { mentorId },
    create: { learnerId, courseId, mentorId, deadlineAt },
    include: { course: true },
  });
  await prisma.$transaction([
    prisma.notification.create({ data: { userId: learnerId, type: "COURSE_ASSIGNED", title: "New course assigned", message: `You have been assigned ${enrollment.course.title}.`, href: `/courses/${enrollment.course.slug}` } }),
    prisma.activityLog.create({ data: { actorId: admin.id, action: "Assigned course", entityType: "Enrollment", entityId: enrollment.id } }),
  ]);
  await sendPushNotification(learnerId, {
    title: "New course assigned",
    body: `You have been assigned ${enrollment.course.title}.`,
    url: `/courses/${enrollment.course.slug}`
  });
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function addQuestionAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const quizId = String(formData.get("quizId") ?? "");
  const type = String(formData.get("type") ?? "") as "MULTIPLE_CHOICE";
  const prompt = String(formData.get("prompt") ?? "");
  const correctAnswer = String(formData.get("correctAnswer") ?? "");
  const points = Number(formData.get("points") ?? 1);
  const order = Number(formData.get("order") ?? 1);
  const options = String(formData.get("options") ?? "").split("\n").map((item) => item.trim()).filter(Boolean);
  if (!prompt || !correctAnswer) throw new Error("Question and answer are required.");
  const existing = await prisma.question.findMany({
    where: { quizId },
    select: { order: true },
  });
  const question = await prisma.question.create({
    data: {
      quizId,
      type,
      prompt,
      correctAnswer,
      points,
      order: resolveAvailableOrder(order, existing.map((item) => item.order)),
      options: type === "MULTIPLE_CHOICE" ? options : undefined,
    },
  });
  await prisma.activityLog.create({
    data: { actorId: admin.id, action: "Created quiz question", entityType: "Question", entityId: question.id },
  });
  revalidatePath("/admin/quizzes");
}

export async function updateQuestionAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const questionId = String(formData.get("questionId") ?? "");
  const type = String(formData.get("type") ?? "") as "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  const prompt = String(formData.get("prompt") ?? "");
  const correctAnswer = String(formData.get("correctAnswer") ?? "");
  const points = Number(formData.get("points") ?? 1);
  const optionsRaw = String(formData.get("options") ?? "");
  const options = optionsRaw ? optionsRaw.split("\n").map((item) => item.trim()).filter(Boolean) : undefined;
  
  if (!prompt || !correctAnswer) throw new Error("Question and answer are required.");
  
  const question = await prisma.question.update({
    where: { id: questionId },
    data: {
      type,
      prompt,
      correctAnswer,
      points,
      options: type === "MULTIPLE_CHOICE" ? options : [],
    },
  });
  await prisma.activityLog.create({
    data: { actorId: admin.id, action: "Updated quiz question", entityType: "Question", entityId: question.id },
  });
  revalidatePath("/admin/quizzes");
}

export async function updateQuizSettingsAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const quizId = String(formData.get("quizId") ?? "");
  const isStrict = formData.get("isStrict") === "on";
  const requireShortAnswerReview = formData.get("requireShortAnswerReview") === "on";
  const timeLimitRaw = formData.get("timeLimit");
  const timeLimit = timeLimitRaw ? parseInt(String(timeLimitRaw), 10) : null;
  const passMark = parseInt(String(formData.get("passMark") ?? "70"), 10);
  const maxAttemptsRaw = formData.get("maxAttempts");
  const maxAttempts = maxAttemptsRaw ? parseInt(String(maxAttemptsRaw), 10) : null;

  await prisma.quiz.update({
    where: { id: quizId },
    data: { isStrict, requireShortAnswerReview, timeLimit, passMark, maxAttempts }
  });
  await prisma.activityLog.create({
    data: { actorId: admin.id, action: "Updated quiz settings", entityType: "Quiz", entityId: quizId },
  });

  revalidatePath("/admin/quizzes");
}

export async function deleteQuestionAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const questionId = String(formData.get("questionId") ?? "");
  const question = await prisma.question.delete({ where: { id: questionId } });
  await prisma.activityLog.create({ data: { actorId: admin.id, action: "Deleted quiz question", entityType: "Question", entityId: questionId } });
  revalidatePath("/admin/quizzes");
}

export async function bulkImportQuestionsAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const quizId = String(formData.get("quizId") ?? "");
  const rawText = String(formData.get("rawText") ?? "");

  if (!rawText.trim()) throw new Error("No text provided.");

  const blocks = rawText.split(/\n\s*\n/);
  const questionsToCreate = [];

  for (const block of blocks) {
    if (!block.trim()) continue;
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);

    let prompt = "";
    const options: string[] = [];
    let correctAnswer = "";

    for (const line of lines) {
      if (/^ANSWER:\s*/i.test(line)) {
        const ansVal = line.replace(/^ANSWER:\s*/i, "").trim();
        // Check if ansVal is a single letter matching an option index (A=0, B=1)
        if (options.length > 0 && /^[A-Z]$/i.test(ansVal)) {
          const charCode = ansVal.toUpperCase().charCodeAt(0);
          if (charCode >= 65 && charCode < 65 + options.length) {
            correctAnswer = options[charCode - 65];
          } else {
            correctAnswer = ansVal;
          }
        } else {
          correctAnswer = ansVal;
        }
      } else if (/^[A-Z][)\.]\s+/i.test(line) || /^[a-z][)\.]\s+/.test(line) || /^-\s+/.test(line)) {
        // Line like "A) Option" or "a. Option" or "- Option"
        options.push(line.replace(/^([A-Za-z][)\.]\s+|-\s+)/, "").trim());
      } else {
        if (!prompt) prompt = line;
        else prompt += "\n" + line;
      }
    }

    if (!prompt) continue;

    let type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" = "SHORT_ANSWER";
    if (options.length > 0) type = "MULTIPLE_CHOICE";
    else if (correctAnswer.toLowerCase() === "true" || correctAnswer.toLowerCase() === "false") type = "TRUE_FALSE";

    questionsToCreate.push({
      quizId,
      type,
      prompt,
      correctAnswer: correctAnswer || "Needs Answer",
      options: options.length > 0 ? options : undefined,
      points: 1,
    });
  }

  if (questionsToCreate.length === 0) throw new Error("Could not parse any valid questions. Please check the formatting.");

  const existing = await prisma.question.findMany({ where: { quizId }, select: { order: true } });
  let currentOrder = existing.length > 0 ? Math.max(...existing.map((q) => q.order)) + 1 : 1;

  for (const q of questionsToCreate) {
    await prisma.question.create({
      data: { ...q, order: currentOrder++ },
    });
  }

  await prisma.activityLog.create({
    data: { actorId: admin.id, action: "Bulk imported quiz questions", entityType: "Quiz", entityId: quizId, metadata: { count: questionsToCreate.length } },
  });

  revalidatePath("/admin/quizzes");
}

const bulkCourseSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  description: z.string().optional(),
  category: z.string().default("General"),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
  estimatedMinutes: z.number().default(60),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  modules: z.array(z.object({
    title: z.string().min(1, "Module title is required"),
    description: z.string().optional(),
    lessons: z.array(z.object({
      title: z.string().min(1, "Lesson title is required"),
      type: z.enum(["TEXT", "YOUTUBE", "VIDEO", "PDF", "LINK", "ASSIGNMENT", "QUIZ"]),
      content: z.string().optional(),
      videoUrl: z.string().optional(),
      videoStartTime: z.number().int().min(0).optional(),
      videoEndTime: z.number().int().min(0).optional(),
      estimatedMinutes: z.number().default(10),
      completionRequired: z.boolean().default(true),
      assignment: z.object({
        instructions: z.string()
      }).optional(),
      quiz: z.object({
        passMark: z.number().default(70),
        isStrict: z.boolean().default(false),
        questions: z.array(z.object({
          prompt: z.string(),
          type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
          correctAnswer: z.string(),
          options: z.string().optional()
        })).optional()
      }).optional()
    })).optional()
  })).optional()
});

export async function bulkImportCourseAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const rawJson = String(formData.get("rawJson") ?? "");
  
  if (!rawJson.trim()) throw new Error("No JSON provided.");

  let parsedJson;
  try {
    parsedJson = JSON.parse(rawJson);
  } catch (err: any) {
    throw new Error(`Invalid JSON format: ${err.message}`);
  }

  const result = bulkCourseSchema.safeParse(parsedJson);
  if (!result.success) {
    const errorMessages = result.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ");
    throw new Error(`Validation failed: ${errorMessages}`);
  }

  const courseData = result.data;

  const createPayload: any = {
    title: courseData.title,
    slug: slugify(courseData.title) + "-" + Date.now().toString().slice(-4),
    description: courseData.description,
    category: courseData.category,
    difficulty: courseData.difficulty,
    estimatedMinutes: courseData.estimatedMinutes,
    status: courseData.status,
  };

  if (courseData.modules && courseData.modules.length > 0) {
    createPayload.modules = {
      create: courseData.modules.map((m, mIndex) => {
        const mod: any = {
          title: m.title,
          description: m.description,
          order: mIndex + 1,
        };

        if (m.lessons && m.lessons.length > 0) {
          mod.lessons = {
            create: m.lessons.map((l, lIndex) => ({
              title: l.title,
              type: l.type,
              content: l.content,
              videoUrl: l.videoUrl,
              videoStartTime: l.videoStartTime || null,
              videoEndTime: l.videoEndTime || null,
              estimatedMinutes: l.estimatedMinutes,
              completionRequired: l.completionRequired,
              order: lIndex + 1,
              assignment: l.type === "ASSIGNMENT" ? {
                create: {
                  instructions: l.assignment?.instructions || l.content || "Complete the assigned task."
                }
              } : undefined,
              quiz: l.type === "QUIZ" ? {
                create: {
                  title: l.title,
                  passMark: l.quiz?.passMark || 70,
                  isStrict: l.quiz?.isStrict || false,
                  questions: l.quiz?.questions && l.quiz.questions.length > 0 ? {
                    create: l.quiz.questions.map((q, qIndex) => ({
                      prompt: q.prompt,
                      type: q.type,
                      correctAnswer: q.correctAnswer,
                      options: q.options || undefined,
                      order: qIndex + 1,
                      points: 1
                    }))
                  } : undefined
                }
              } : undefined
            }))
          };
        }
        return mod;
      })
    };
  }

  const course = await prisma.course.create({
    data: createPayload
  });

  await prisma.activityLog.create({
    data: { actorId: admin.id, action: "Bulk imported course via JSON", entityType: "Course", entityId: course.id }
  });

  revalidatePath("/admin/courses");
  return { success: true, courseId: course.id };
}
