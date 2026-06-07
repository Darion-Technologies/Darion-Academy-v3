import { PrismaClient, type LessonType } from "../generated/prisma";

const prisma = new PrismaClient();

const courses = [
  {
    slug: "darion-onboarding",
    title: "Darion Onboarding",
    description: "Understand Darion Group standards, communication, and core operating practices.",
    category: "Internal",
    estimatedMinutes: 60,
  },
  {
    slug: "secure-web-application-foundations",
    title: "Secure Web Application Foundations",
    description: "Learn practical security foundations for authentication, permissions, and review workflows.",
    category: "Engineering",
    estimatedMinutes: 150,
  },
  {
    slug: "microsoft-forms-basics",
    title: "Microsoft Forms Basics",
    description: "Build reliable forms, collect documents, and manage structured response workflows.",
    category: "HR Workflow",
    estimatedMinutes: 80,
  },
  {
    slug: "hr-documentation-workflow",
    title: "HR Documentation Workflow",
    description: "Follow the correct review, approval, and retention process for internal HR records.",
    category: "Operations",
    estimatedMinutes: 120,
  },
];

async function upsertLesson(moduleId: string, order: number, title: string, type: LessonType) {
  const existing = await prisma.lesson.findUnique({ where: { moduleId_order: { moduleId, order } } });
  return existing
    ? prisma.lesson.update({ where: { id: existing.id }, data: { title, type } })
    : prisma.lesson.create({
        data: {
          moduleId,
          order,
          title,
          type,
          estimatedMinutes: type === "QUIZ" ? 10 : 20,
          content: type === "TEXT" ? "Darion Academy lesson content and required learning outcomes." : null,
        },
      });
}

async function main() {
  const template = await prisma.certificateTemplate.upsert({
    where: { name: "Darion Academy Corporate" },
    update: { isDefault: true, primaryColor: "#008CBB", accentColor: "#0B1824" },
    create: {
      name: "Darion Academy Corporate",
      isDefault: true,
      primaryColor: "#008CBB",
      accentColor: "#0B1824",
      backgroundColor: "#F3F7F8",
      textColor: "#101418",
    },
  });

  for (const item of courses) {
    const course = await prisma.course.upsert({
      where: { slug: item.slug },
      update: { ...item, status: "PUBLISHED", certificateTemplateId: template.id },
      create: { ...item, status: "PUBLISHED", certificateTemplateId: template.id },
    });
    const foundations = await prisma.module.upsert({
      where: { courseId_order: { courseId: course.id, order: 1 } },
      update: { title: "Core foundations" },
      create: { courseId: course.id, title: "Core foundations", order: 1 },
    });
    const practice = await prisma.module.upsert({
      where: { courseId_order: { courseId: course.id, order: 2 } },
      update: { title: "Applied practice" },
      create: { courseId: course.id, title: "Applied practice", order: 2 },
    });
    const quizLesson = await upsertLesson(foundations.id, 1, "Welcome and learning outcomes", "TEXT");
    await upsertLesson(foundations.id, 2, "Guided walkthrough", "YOUTUBE");
    const assessmentLesson = await upsertLesson(foundations.id, 3, "Knowledge check", "QUIZ");
    await upsertLesson(practice.id, 1, "Practice guide", "TEXT");
    const assignmentLesson = await upsertLesson(practice.id, 2, "Applied assignment", "ASSIGNMENT");

    await prisma.assignment.upsert({
      where: { lessonId: assignmentLesson.id },
      update: { instructions: "Complete the assigned task and submit supporting evidence." },
      create: { lessonId: assignmentLesson.id, instructions: "Complete the assigned task and submit supporting evidence." },
    });
    const quiz = await prisma.quiz.upsert({
      where: { lessonId: assessmentLesson.id },
      update: { title: `${course.title} knowledge check`, passMark: 70, maxAttempts: 2 },
      create: { lessonId: assessmentLesson.id, title: `${course.title} knowledge check`, passMark: 70, maxAttempts: 2 },
    });
    if (await prisma.question.count({ where: { quizId: quiz.id } }) === 0) {
      await prisma.question.createMany({
        data: [
          { quizId: quiz.id, prompt: "Which action best demonstrates completing the required learning outcome?", type: "MULTIPLE_CHOICE", options: ["Review the material", "Skip the lesson", "Share credentials"], correctAnswer: "Review the material", order: 1 },
          { quizId: quiz.id, prompt: "True or false: submitted work may require mentor review.", type: "TRUE_FALSE", options: ["True", "False"], correctAnswer: "True", order: 2 },
        ],
      });
    }
    void quizLesson;
  }
}

main()
  .then(() => console.log("Production catalog seed completed."))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
