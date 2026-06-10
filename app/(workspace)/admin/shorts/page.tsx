import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShortsAdminPanel } from "./_components/ShortsAdminPanel";

export const metadata = {
  title: "Manage Technical Shorts - Admin",
};

export default async function AdminShortsPage() {
  const user = await requireUser();

  if (user.role !== "ADMIN" && user.role !== "MENTOR") {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Technical Shorts</h2>
      </div>
      <p className="text-muted-foreground">
        Search, review, and approve YouTube technical shorts for the LMS.
      </p>

      <ShortsAdminPanel adminId={user.id} />
    </div>
  );
}
