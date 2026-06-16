import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="flex w-full h-full overflow-hidden antialiased">
      {/* Sidebar Skeleton */}
      <div className="flex w-full flex-col border-r border-border bg-card sm:w-[280px] shrink-0 h-full">
        <div className="flex flex-col p-3 gap-3 border-b border-border">
          {/* Search Skeleton */}
          <Skeleton className="h-8 w-full rounded-none" />

          {/* Tabs Skeleton */}
          <div className="flex gap-1 h-7">
            <Skeleton className="h-full flex-1 rounded-none" />
            <Skeleton className="h-full flex-1 rounded-none" />
          </div>

          <Skeleton className="h-4 w-16 mt-1" />

          {/* Button Skeleton */}
          <Skeleton className="h-8 w-full rounded-none" />
        </div>

        {/* Conversation List Skeleton */}
        <div className="flex-1 overflow-y-auto p-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-start gap-2.5 border-b border-border p-2.5 w-full">
              <Skeleton className="size-10 rounded-none shrink-0" />
              <div className="flex flex-1 flex-col pt-0.5 gap-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3.5 w-24 rounded-none" />
                  <Skeleton className="h-2 w-8 rounded-none" />
                </div>
                <Skeleton className="h-2.5 w-full rounded-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area Skeleton */}
      <div className="hidden sm:flex flex-1 flex-col overflow-hidden relative bg-card">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-card h-12 shrink-0">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-8 rounded-none" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-20 rounded-none" />
              <Skeleton className="h-2 w-12 rounded-none" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-7 rounded-none" />
            <Skeleton className="size-7 rounded-none" />
            <Skeleton className="size-7 rounded-none" />
          </div>
        </div>

        {/* Message Area Skeleton */}
        <div className="flex-1 p-4 flex flex-col justify-end gap-6">
          <div className="flex flex-col gap-4 max-w-[75%]">
            <div className="flex gap-2">
              <Skeleton className="size-8 rounded-none shrink-0" />
              <Skeleton className="h-16 w-[200px] rounded-none" />
            </div>
          </div>
          <div className="flex flex-col gap-4 max-w-[75%] self-end">
            <div className="flex gap-2 flex-row-reverse">
              <Skeleton className="size-8 rounded-none shrink-0" />
              <Skeleton className="h-12 w-[160px] rounded-none" />
            </div>
          </div>
          <div className="flex flex-col gap-4 max-w-[75%]">
            <div className="flex gap-2">
              <Skeleton className="size-8 rounded-none shrink-0" />
              <Skeleton className="h-20 w-[240px] rounded-none" />
            </div>
          </div>
        </div>

        {/* Input Skeleton */}
        <div className="px-3 pb-3 bg-card mt-auto shrink-0">
          <div className="flex items-end gap-2 p-2 border border-border bg-card">
            <Skeleton className="size-8 rounded-none shrink-0" />
            <Skeleton className="h-10 w-full rounded-none" />
            <Skeleton className="size-8 rounded-none shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
