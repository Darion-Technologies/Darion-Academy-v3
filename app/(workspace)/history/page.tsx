import { requireUser } from "@/lib/auth";
import { getWatchHistoryAction, getCommentHistoryAction } from "@/actions/history";
import Link from "next/link";
import { History, MessageSquare, PlaySquare, BookOpen, ExternalLink, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "History - Darion Academy",
};

export default async function HistoryPage() {
  const user = await requireUser();
  const [watchHistory, commentHistory] = await Promise.all([
    getWatchHistoryAction(user.id),
    getCommentHistoryAction(user.id)
  ]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <h2 className="text-3xl font-bold tracking-tight">History</h2>
      </div>
      
      <Tabs defaultValue="watch" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="watch" className="flex items-center gap-2">
            <History className="h-4 w-4" /> Watch History
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Comments History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="watch" className="space-y-4">
          {watchHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg bg-card/50">
              <History className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No watch history</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">
                You haven't watched any courses or tech shorts yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {watchHistory.map((item) => (
                <Link 
                  key={item.id} 
                  href={item.url}
                  className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border bg-card p-4 hover:border-primary/50 transition-colors shadow-sm"
                >
                  <div className="flex-shrink-0 w-32 h-20 bg-muted rounded-md overflow-hidden relative">
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                        {item.type === "COURSE" ? <BookOpen className="h-6 w-6" /> : <PlaySquare className="h-6 w-6" />}
                      </div>
                    )}
                    <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-medium text-white uppercase tracking-wider">
                      {item.type}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                    {item.subtitle && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {item.subtitle}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{item.watchedAt.toLocaleDateString()} at {item.watchedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 flex items-center self-start sm:self-auto opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                    <ExternalLink className="h-5 w-5 text-primary" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="comments" className="space-y-4">
          {commentHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg bg-card/50">
              <MessageSquare className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No comments yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">
                You haven't posted any comments on tech shorts.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {commentHistory.map((comment) => (
                <div key={comment.id} className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                  <div className="p-4 bg-muted/20 border-b flex items-center justify-between">
                    <Link href={comment.reference.url} className="group flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity">
                      {comment.reference.thumbnailUrl ? (
                        <img src={comment.reference.thumbnailUrl} alt="" className="h-8 w-12 object-cover rounded shrink-0" />
                      ) : (
                        <div className="h-8 w-12 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <PlaySquare className="h-4 w-4" />
                        </div>
                      )}
                      <div className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {comment.reference.title}
                      </div>
                    </Link>
                    <div className="text-xs text-muted-foreground shrink-0 ml-4 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {comment.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
