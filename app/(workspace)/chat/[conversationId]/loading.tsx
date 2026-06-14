import { Skeleton } from "@/components/ui/skeleton";

export default function ChatConversationLoading() {
  return (
    <div className="flex h-full flex-col animate-in fade-in duration-500 w-full">
      {/* Header */}
      <div className="flex items-center border-b border-border p-4 bg-muted/20">
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden p-4 space-y-6 flex flex-col justify-end pb-8">
        {[
          { isMe: false, w: "w-3/4" },
          { isMe: true, w: "w-1/2" },
          { isMe: false, w: "w-2/3" },
          { isMe: true, w: "w-3/4" },
          { isMe: false, w: "w-1/3" },
        ].map((msg, i) => (
          <div key={i} className={`flex ${msg.isMe ? "justify-end" : "justify-start"} w-full`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar Skeleton */}
              <Skeleton className="size-8 rounded-full shrink-0" />
              
              <div className={`flex flex-col gap-1 ${msg.isMe ? "items-end" : "items-start"}`}>
                {/* Name & Time */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2 w-12" />
                </div>
                {/* Bubble */}
                <Skeleton className={`h-12 ${msg.w} min-w-[200px] ${msg.isMe ? "bg-primary/20" : "bg-muted"}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-background">
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-none border border-border" />
          <Skeleton className="h-10 w-16" />
        </div>
      </div>
    </div>
  );
}
