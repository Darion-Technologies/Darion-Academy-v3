import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="flex h-[calc(100vh-130px)] w-full overflow-hidden border border-border shadow-sm rounded-none bg-card">
      {children}
    </div>
  );
}
