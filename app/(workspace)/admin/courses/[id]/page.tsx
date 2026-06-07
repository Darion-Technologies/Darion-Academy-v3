import {
  createLessonAction,
  createModuleAction,
  deleteCourseAction,
  deleteLessonAction,
  deleteModuleAction,
  updateLessonAction,
  updateModuleAction,
} from "@/app/actions/admin";
import { assignCourseTemplateAction } from "@/app/actions/certificates";
import { CourseForm } from "@/components/admin/course-form";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const lessonTypes = ["TEXT", "YOUTUBE", "VIDEO", "PDF", "LINK", "ASSIGNMENT", "QUIZ"] as const;

export default async function ManageCoursePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;
  const [course, certificateTemplates] = await Promise.all([
    prisma.course.findUniqueOrThrow({
      where: { id },
      include: { modules: { include: { lessons: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
    }),
    prisma.certificateTemplate.findMany({ where: { status: "ACTIVE" }, orderBy: [{ isDefault: "desc" }, { name: "asc" }] }),
  ]);

  return (
    <>
      <PageHeader title={course.title} description="Edit the course, modules, lessons, publishing state, and certificate design." />
      <div className="grid gap-6 xl:grid-cols-[1fr_1.35fr]">
        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Course details</CardTitle></CardHeader><CardContent><CourseForm course={course} /></CardContent></Card>
          <Card><CardHeader><CardTitle>Certificate template</CardTitle></CardHeader><CardContent>
            <form action={assignCourseTemplateAction} className="space-y-3">
              <input type="hidden" name="courseId" value={course.id} />
              <div><Label>Template</Label><Select name="templateId" defaultValue={course.certificateTemplateId ?? ""}><option value="">Use global default</option>{certificateTemplates.map((template) => <option key={template.id} value={template.id}>{template.name}{template.isDefault ? " (default)" : ""}</option>)}</Select></div>
              <SubmitButton pendingText="Assigning...">Save template</SubmitButton>
            </form>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Add module</CardTitle></CardHeader><CardContent>
            <form action={createModuleAction} className="space-y-3">
              <input type="hidden" name="courseId" value={course.id} />
              <div><Label>Title</Label><Input name="title" required /></div>
              <div><Label>Description</Label><Textarea name="description" /></div>
              <div><Label>Order</Label><Input name="order" type="number" min={1} defaultValue={course.modules.length + 1} /></div>
              <SubmitButton pendingText="Adding...">Add module</SubmitButton>
            </form>
          </CardContent></Card>
          {course.modules.length > 0 && <Card><CardHeader><CardTitle>Add lesson</CardTitle></CardHeader><CardContent>
            <LessonFields modules={course.modules} defaultOrder={Math.max(0, ...course.modules[0].lessons.map((lesson) => lesson.order)) + 1} action={createLessonAction} />
          </CardContent></Card>}
          <Card><CardHeader><CardTitle>Delete or archive</CardTitle></CardHeader><CardContent>
            <p className="mb-3 text-sm text-muted-foreground">Courses with learner history are archived. Empty courses are permanently deleted.</p>
            <form action={deleteCourseAction}><input type="hidden" name="courseId" value={course.id} /><SubmitButton variant="destructive" pendingText="Processing...">Delete course</SubmitButton></form>
          </CardContent></Card>
        </div>

        <div className="space-y-4">
          {course.modules.map((courseModule) => (
            <Card key={courseModule.id}>
              <CardHeader><CardTitle>{courseModule.order}. {courseModule.title}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <details>
                  <summary className="cursor-pointer text-sm font-semibold">Edit module</summary>
                  <form action={updateModuleAction} className="mt-3 grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="id" value={courseModule.id} />
                    <div><Label>Title</Label><Input name="title" defaultValue={courseModule.title} required /></div>
                    <div><Label>Order</Label><Input name="order" type="number" min={1} defaultValue={courseModule.order} required /></div>
                    <div className="md:col-span-2"><Label>Description</Label><Textarea name="description" defaultValue={courseModule.description ?? ""} /></div>
                    <div className="flex gap-2 md:col-span-2"><SubmitButton size="sm" pendingText="Saving...">Save module</SubmitButton></div>
                  </form>
                  <form action={deleteModuleAction} className="mt-2"><input type="hidden" name="id" value={courseModule.id} /><SubmitButton variant="destructive" size="sm" pendingText="Deleting...">Delete module</SubmitButton></form>
                </details>
                {courseModule.lessons.length ? courseModule.lessons.map((lesson) => (
                  <details key={lesson.id} className="border p-3">
                    <summary className="cursor-pointer text-sm font-semibold">{lesson.order}. {lesson.title} <span className="text-xs font-normal text-muted-foreground">({lesson.type})</span></summary>
                    <form action={updateLessonAction} className="mt-3 grid gap-3 md:grid-cols-2">
                      <input type="hidden" name="id" value={lesson.id} />
                      <div><Label>Title</Label><Input name="title" defaultValue={lesson.title} required /></div>
                      <div><Label>Type</Label><Select name="type" defaultValue={lesson.type}>{lessonTypes.map((type) => <option key={type}>{type}</option>)}</Select></div>
                      <div className="md:col-span-2"><Label>Content / instructions</Label><Textarea name="content" defaultValue={lesson.content ?? ""} /></div>
                      <div><Label>YouTube URL</Label><Input name="videoUrl" defaultValue={lesson.videoUrl ?? ""} /></div>
                      <div><Label>External URL</Label><Input name="externalUrl" defaultValue={lesson.externalUrl ?? ""} /></div>
                      <div><Label>Order</Label><Input name="order" type="number" min={1} defaultValue={lesson.order} /></div>
                      <div><Label>Minutes</Label><Input name="estimatedMinutes" type="number" min={1} defaultValue={lesson.estimatedMinutes} /></div>
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="completionRequired" defaultChecked={lesson.completionRequired} /> Required for completion</label>
                      <div className="md:col-span-2"><SubmitButton size="sm" pendingText="Saving...">Save lesson</SubmitButton></div>
                    </form>
                    <form action={deleteLessonAction} className="mt-2"><input type="hidden" name="id" value={lesson.id} /><SubmitButton variant="destructive" size="sm" pendingText="Deleting...">Delete lesson</SubmitButton></form>
                  </details>
                )) : <p className="text-sm text-muted-foreground">No lessons yet.</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

function LessonFields({
  modules,
  defaultOrder,
  action,
}: {
  modules: { id: string; title: string }[];
  defaultOrder: number;
  action: (formData: FormData) => Promise<void>;
}) {
  return <form action={action} className="space-y-3">
    <div><Label>Module</Label><Select name="moduleId">{modules.map((courseModule) => <option key={courseModule.id} value={courseModule.id}>{courseModule.title}</option>)}</Select></div>
    <div><Label>Title</Label><Input name="title" required /></div>
    <div><Label>Type</Label><Select name="type">{lessonTypes.map((type) => <option key={type}>{type}</option>)}</Select></div>
    <div><Label>Content / instructions</Label><Textarea name="content" /></div>
    <div><Label>YouTube URL</Label><Input name="videoUrl" /></div>
    <div><Label>External URL</Label><Input name="externalUrl" /></div>
    <div><Label>Lesson file</Label><Input name="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,image/*,video/*" /></div>
    <div className="grid grid-cols-2 gap-3"><div><Label>Order</Label><Input name="order" type="number" min={1} defaultValue={defaultOrder} /></div><div><Label>Minutes</Label><Input name="estimatedMinutes" type="number" min={1} defaultValue={10} /></div></div>
    <label className="flex gap-2 text-sm"><input type="checkbox" name="completionRequired" defaultChecked /> Required for completion</label>
    <SubmitButton pendingText="Adding...">Add lesson</SubmitButton>
  </form>;
}
