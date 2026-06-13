import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { NewCourseModal } from "@/components/admin/new-course-modal";

export default function AdminCoursesLoading() {
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
            {[...Array(6)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-12 shrink-0" />
                    <div className="space-y-2">
                      <Skeleton className={`h-4 ${i % 2 === 0 ? "w-48" : i % 3 === 0 ? "w-32" : "w-40"}`} />
                      <Skeleton className={`h-3 ${i % 2 === 0 ? "w-20" : i % 3 === 0 ? "w-16" : "w-24"}`} />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-6" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-8 w-16" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
