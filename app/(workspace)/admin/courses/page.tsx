import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Modules</TableHead>
              <TableHead>Learners</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                  No courses found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {course.thumbnailUrl ? (
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                          <Image src={`/api/admin/courses/${course.id}/thumbnail`} alt="" fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          No Image
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.category}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral">{course.status}</Badge>
                  </TableCell>
                  <TableCell>{course._count.modules}</TableCell>
                  <TableCell>{course._count.enrollments}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/courses/${course.id}`}>Manage</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
