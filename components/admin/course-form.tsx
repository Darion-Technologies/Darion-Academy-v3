"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { saveCourseAction, type ActionState } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CourseFormValue = {
  id: string;
  title: string;
  category: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  estimatedMinutes: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  description: string;
  thumbnailUrl?: string | null;
};

export function CourseForm({ course }: { course?: CourseFormValue }) {
  const [thumbnailVersion, setThumbnailVersion] = useState(0);

  async function saveCourseWithThumbnail(
    previousState: ActionState,
    formData: FormData,
  ): Promise<ActionState> {
    const thumbnail = formData.get("thumbnail");
    formData.delete("thumbnail");

    const result = await saveCourseAction(previousState, formData);
    if (result.error || !result.courseId || !(thumbnail instanceof File) || thumbnail.size === 0) {
      return result;
    }

    try {
      const response = await fetch(`/api/admin/courses/${result.courseId}/thumbnail`, {
        method: "PUT",
        headers: {
          "Content-Type": thumbnail.type || "application/octet-stream",
          "X-File-Name": encodeURIComponent(thumbnail.name),
        },
        body: thumbnail,
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) {
        return { ...result, error: payload.error ?? "The thumbnail could not be uploaded.", success: undefined };
      }
      setThumbnailVersion(Date.now());
      return { ...result, success: "Course and thumbnail saved." };
    } catch {
      return { ...result, error: "The course was saved, but the thumbnail upload was interrupted.", success: undefined };
    }
  }

  const [state, action, pending] = useActionState(saveCourseWithThumbnail, {});
  return <form action={action} className="grid gap-4 md:grid-cols-2">
    {course && <input type="hidden" name="id" value={course.id} />}
    <div><Label>Title</Label><Input name="title" defaultValue={course?.title} required /></div>
    <div><Label>Category</Label><Input name="category" defaultValue={course?.category} required /></div>
    <div><Label>Difficulty</Label><Select name="difficulty" defaultValue={course?.difficulty ?? "BEGINNER"}><option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option><option value="ADVANCED">Advanced</option></Select></div>
    <div><Label>Estimated minutes</Label><Input name="estimatedMinutes" type="number" defaultValue={course?.estimatedMinutes ?? 60} min={1} required /></div>
    <div><Label>Status</Label><Select name="status" defaultValue={course?.status ?? "DRAFT"}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></Select></div>
    <div>
      <Label>Thumbnail</Label>
      <Input name="thumbnail" type="file" accept="image/png,image/jpeg,image/webp" />
      {(course?.thumbnailUrl || (state.courseId && thumbnailVersion > 0)) && (
        <div className="relative mt-3 aspect-[16/9] overflow-hidden border bg-muted">
          <Image
            key={thumbnailVersion}
            src={`/api/admin/courses/${state.courseId ?? course?.id}/thumbnail?v=${thumbnailVersion}`}
            alt={`${course?.title ?? "Course"} thumbnail`}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
    </div>
    <div className="md:col-span-2"><Label>Description</Label><Textarea name="description" defaultValue={course?.description} required /></div>
    {state.error && <p className="text-sm text-red-600 md:col-span-2">{state.error}</p>}
    {state.success && <p className="text-sm text-emerald-600 md:col-span-2">{state.success}</p>}
    <div className="md:col-span-2"><Button disabled={pending}>{pending ? "Saving..." : course ? "Update course" : "Create course"}</Button></div>
  </form>;
}
