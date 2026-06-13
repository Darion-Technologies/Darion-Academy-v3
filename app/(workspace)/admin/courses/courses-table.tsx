"use client";

import Image from "next/image";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

// This type matches the data returned by Prisma in page.tsx
export type CourseData = {
  id: string;
  title: string;
  category: string;
  status: string;
  thumbnailUrl: string | null;
  _count: {
    modules: number;
    enrollments: number;
  };
};

export const columns: ColumnDef<CourseData>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="-ml-4 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Course
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div className="flex items-center gap-3">
          {course.thumbnailUrl ? (
            <div className="relative size-12 shrink-0 overflow-hidden border bg-muted">
              <Image 
                src={`/api/admin/courses/${course.id}/thumbnail`} 
                alt="" 
                fill 
                className="object-cover" 
                unoptimized 
              />
            </div>
          ) : (
            <div className="relative size-12 shrink-0 overflow-hidden border bg-muted flex items-center justify-center text-xs text-muted-foreground">
              No Image
            </div>
          )}
          <div>
            <p className="font-medium text-foreground">{course.title}</p>
            <p className="text-xs text-muted-foreground">{course.category}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="neutral">{row.original.status}</Badge>,
  },
  {
    accessorKey: "_count.modules",
    header: "Modules",
    cell: ({ row }) => row.original._count.modules,
  },
  {
    accessorKey: "_count.enrollments",
    header: "Learners",
    cell: ({ row }) => row.original._count.enrollments,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/courses/${row.original.id}`}>Manage</Link>
          </Button>
        </div>
      );
    },
  },
];

export function CoursesTable({ data }: { data: CourseData[] }) {
  return <DataTable columns={columns} data={data} searchKey="title" />;
}
