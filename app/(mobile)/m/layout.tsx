import { MobileBottomTabs } from "@/components/mobile/mobile-bottom-tabs";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground w-full">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-[calc(60px+env(safe-area-inset-bottom))]">
        {children}
      </main>
      <MobileBottomTabs />
    </div>
  );
}
