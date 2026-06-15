import { deleteCourseAction, forceDeleteCourseAction } from "@/app/actions/admin";
import { assignCourseTemplateAction } from "@/app/actions/certificates";
import { CourseForm } from "@/components/admin/course-form";
import { CurriculumBuilder } from "@/components/admin/curriculum-builder";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Settings, BookOpen } from "lucide-react";

import { Suspense } from "react";
import { AdminCourseSkeleton } from "../_components/admin-course-skeleton";

export default async function ManageCoursePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;
  
  const courseBase = await prisma.course.findUniqueOrThrow({
    where: { id },
    select: { id: true, title: true }
  });

  return (
    <>
      <PageHeader title={courseBase.title} description="Edit the course curriculum, publishing state, and settings." />
      
      <Suspense fallback={<AdminCourseSkeleton />}>
        <ManageCourseData id={id} />
      </Suspense>
    </>
  );
}

async function ManageCourseData({ id }: { id: string }) {
  const [course, certificateTemplates] = await Promise.all([
    prisma.course.findUniqueOrThrow({
      where: { id },
      include: { modules: { include: { lessons: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
    }),
    prisma.certificateTemplate.findMany({ where: { status: "ACTIVE" }, orderBy: [{ isDefault: "desc" }, { name: "asc" }] }),
  ]);

  return (
    <div className="max-w-5xl mx-auto">
      <Tabs defaultValue="curriculum" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="curriculum" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Curriculum
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum" className="mt-0">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Curriculum Builder</CardTitle>
              <CardDescription>Drag and drop (coming soon) or edit modules and lessons to structure your course.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <CurriculumBuilder course={course} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent>
              <CourseForm course={course} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Certificate Template</CardTitle>
              <CardDescription>Select the template awarded when a learner completes this course.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={assignCourseTemplateAction} className="space-y-4 max-w-lg">
                <input type="hidden" name="courseId" value={course.id} />
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select name="templateId" defaultValue={course.certificateTemplateId ?? ""}>
                    <option value="">Use global default</option>
                    {certificateTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}{template.isDefault ? " (default)" : ""}
                      </option>
                    ))}
                  </Select>
                </div>
                <SubmitButton pendingText="Assigning...">Save Template</SubmitButton>
              </form>
            </CardContent>
          </Card>
          
          <Card className="border-red-500/20 shadow-sm bg-red-500/5 dark:bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Courses with learner history are archived. Empty courses are permanently deleted. This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <form action={deleteCourseAction}>
                  <input type="hidden" name="courseId" value={course.id} />
                  <SubmitButton variant="secondary" pendingText="Processing...">Smart Delete / Archive</SubmitButton>
                </form>
                <form action={forceDeleteCourseAction}>
                  <input type="hidden" name="courseId" value={course.id} />
                  <SubmitButton variant="destructive" pendingText="Deleting...">Force Permanent Delete</SubmitButton>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
