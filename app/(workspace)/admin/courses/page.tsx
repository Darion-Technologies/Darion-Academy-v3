import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CoursesTable } from "./courses-table";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewCourseModal } from "@/components/admin/new-course-modal";

export default async function AdminCoursesPage() {
  await requireRole("ADMIN");
  const courses = await prisma.course.findMany({ 
    include: { _count: { select: { modules: true, enrollments: true } } }, 
    orderBy: { updatedAt: "desc" } 
  });

  return (
    <>
      <PageHeader 
        title="Courses" 
        description="Create and structure the academy catalog." 
        action={<NewCourseModal />}
      />

      <Card>
        <CoursesTable data={courses} />
      </Card>
    </>
  );
}
