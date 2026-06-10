"use client";

import { useState } from "react";
import { markShortWatchedAction, toggleShortBookmarkAction } from "@/actions/shorts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Label } from "@/components/ui/label";

export function ShortWatchClient({ 
  short, 
  userId, 
  isWatchedInitially, 
  isBookmarkedInitially,
  relatedShorts
}: { 
  short: any, 
  userId: string,
  isWatchedInitially: boolean,
  isBookmarkedInitially: boolean,
  relatedShorts: any[]
}) {
  const [isWatched, setIsWatched] = useState(isWatchedInitially);
  const [isBookmarked, setIsBookmarked] = useState(isBookmarkedInitially);
  const [loadingWatch, setLoadingWatch] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<Record<string, boolean | null>>({});

  async function handleMarkWatched() {
    if (isWatched) return;
    setLoadingWatch(true);
    try {
      await markShortWatchedAction(short.id, userId);
      setIsWatched(true);
      toast.success("Marked as watched!");
    } catch (error: any) {
      toast.error("Failed to mark as watched");
    } finally {
      setLoadingWatch(false);
    }
  }

  async function handleToggleBookmark() {
    setLoadingBookmark(true);
    try {
      const res = await toggleShortBookmarkAction(short.id, userId);
      setIsBookmarked(res.bookmarked);
      toast.success(res.bookmarked ? "Bookmarked!" : "Removed bookmark");
    } catch (error: any) {
      toast.error("Failed to toggle bookmark");
    } finally {
      setLoadingBookmark(false);
    }
  }

  function handleCheckAnswer(quizId: string, correctAnswer: string) {
    const selected = quizAnswers[quizId];
    if (!selected) {
      toast.error("Please select an answer");
      return;
    }
    const isCorrect = selected === correctAnswer;
    setQuizResults(prev => ({ ...prev, [quizId]: isCorrect }));
    
    // Automatically mark as watched if they attempt a quiz successfully
    if (isCorrect && !isWatched) {
      handleMarkWatched();
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-lg mx-auto max-w-[400px]">
          <iframe 
            src={`https://www.youtube-nocookie.com/embed/${short.youtubeVideoId}?autoplay=0`} 
            title={short.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg bg-card">
          <div>
            <h3 className="font-semibold">{short.channelName}</h3>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary">{short.category}</Badge>
              <Badge variant="outline">{short.durationSeconds}s</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={isBookmarked ? "default" : "outline"} 
              size="sm" 
              onClick={handleToggleBookmark}
              disabled={loadingBookmark}
            >
              {loadingBookmark ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
               isBookmarked ? <BookmarkCheck className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
              {isBookmarked ? "Saved" : "Save"}
            </Button>
            <Button 
              variant={isWatched ? "default" : "default"} 
              size="sm" 
              onClick={handleMarkWatched}
              disabled={loadingWatch || isWatched}
              className={isWatched ? "bg-green-600 hover:bg-green-700 text-white" : ""}
            >
              {loadingWatch ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
               <CheckCircle2 className="mr-2 h-4 w-4" />}
              {isWatched ? "Watched" : "Mark as Watched"}
            </Button>
          </div>
        </div>

        {short.quizzes && short.quizzes.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Knowledge Check</h3>
            {short.quizzes.map((quiz: any, index: number) => {
              const result = quizResults[quiz.id];
              return (
                <Card key={quiz.id} className={result === true ? "border-green-500" : result === false ? "border-red-500" : ""}>
                  <CardHeader>
                    <CardTitle className="text-base font-medium">Q{index + 1}: {quiz.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 border rounded-md">
                        <input 
                          type="radio" 
                          disabled={result === true}
                          name={`quiz-${quiz.id}`}
                          value="A" 
                          id={`q-${quiz.id}-A`}
                          checked={quizAnswers[quiz.id] === "A"}
                          onChange={(e) => setQuizAnswers(prev => ({...prev, [quiz.id]: "A"}))}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`q-${quiz.id}-A`} className="flex-1 cursor-pointer">{quiz.optionA}</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 border rounded-md">
                        <input 
                          type="radio" 
                          disabled={result === true}
                          name={`quiz-${quiz.id}`}
                          value="B" 
                          id={`q-${quiz.id}-B`}
                          checked={quizAnswers[quiz.id] === "B"}
                          onChange={(e) => setQuizAnswers(prev => ({...prev, [quiz.id]: "B"}))}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`q-${quiz.id}-B`} className="flex-1 cursor-pointer">{quiz.optionB}</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 border rounded-md">
                        <input 
                          type="radio" 
                          disabled={result === true}
                          name={`quiz-${quiz.id}`}
                          value="C" 
                          id={`q-${quiz.id}-C`}
                          checked={quizAnswers[quiz.id] === "C"}
                          onChange={(e) => setQuizAnswers(prev => ({...prev, [quiz.id]: "C"}))}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`q-${quiz.id}-C`} className="flex-1 cursor-pointer">{quiz.optionC}</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 border rounded-md">
                        <input 
                          type="radio" 
                          disabled={result === true}
                          name={`quiz-${quiz.id}`}
                          value="D" 
                          id={`q-${quiz.id}-D`}
                          checked={quizAnswers[quiz.id] === "D"}
                          onChange={(e) => setQuizAnswers(prev => ({...prev, [quiz.id]: "D"}))}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`q-${quiz.id}-D`} className="flex-1 cursor-pointer">{quiz.optionD}</Label>
                      </div>
                    </div>

                    {result !== true && (
                      <Button size="sm" onClick={() => handleCheckAnswer(quiz.id, quiz.answer)}>
                        Check Answer
                      </Button>
                    )}

                    {result === true && (
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-sm">
                        <strong>Correct!</strong> {quiz.explanation && <span>{quiz.explanation}</span>}
                      </div>
                    )}
                    {result === false && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md text-sm">
                        Incorrect. Try again.
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">Related Shorts</h3>
        {relatedShorts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No related shorts found.</p>
        ) : (
          <div className="grid gap-4">
            {relatedShorts.map(rs => (
              <Link key={rs.id} href={`/dashboard/shorts/${rs.id}`} className="group flex gap-3 p-2 rounded-lg hover:bg-muted transition-colors border">
                <div className="relative aspect-[9/16] w-16 bg-black rounded overflow-hidden flex-shrink-0">
                  {rs.thumbnailUrl && (
                    <img src={rs.thumbnailUrl} alt={rs.title} className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <Badge className="absolute bottom-1 right-1 text-[8px] px-1 py-0 bg-black/70">{rs.durationSeconds}s</Badge>
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <h4 className="font-medium text-sm line-clamp-2 group-hover:underline">{rs.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{rs.channelName}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
