import { requireUser } from "@/lib/auth";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="flex flex-1 w-full overflow-hidden bg-card border-x border-border">
      {children}
    </div>
  );
}
