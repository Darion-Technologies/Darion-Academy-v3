"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Play, CheckCircle2, Bookmark, BookmarkCheck, ExternalLink, FileQuestion, MessageSquare, Heart, Check, X, PenLine, Save } from "lucide-react";
import { markShortWatchedAction, toggleShortBookmarkAction, getShortCommentsAction, postShortCommentAction, getShortNoteAction, saveShortNoteAction } from "@/actions/shorts";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

const CATEGORIES = ["All", "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Git", "Docker", "Linux", "Database", "AI", "DevOps", "Cybersecurity", "Other"];

export function LearnerShortsFeed({ 
  initialShorts, 
  watchedSet: initialWatchedSet, 
  bookmarkedSet: initialBookmarkedSet,
  userId
}: { 
  initialShorts: any[], 
  watchedSet: Set<string>, 
  bookmarkedSet: Set<string>,
  userId: string
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [watchedSet, setWatchedSet] = useState<Set<string>>(initialWatchedSet);
  const [bookmarkedSet, setBookmarkedSet] = useState<Set<string>>(initialBookmarkedSet);
  
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});

  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Notes state
  const [currentNotes, setCurrentNotes] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const filteredShorts = initialShorts.filter(short => {
    const matchesSearch = short.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          short.tags.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = category === "All" || short.category === category;
    return matchesSearch && matchesCategory;
  });

  // Intersection Observer for scroll snapping detection
  useEffect(() => {
    if (!containerRef.current) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) {
              setCurrentIndex(index);
            }
          }
        });
      },
      { threshold: 0.6 } // When 60% of the video is visible, it becomes the current index
    );

    const elements = containerRef.current.querySelectorAll(".short-item");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [filteredShorts]);

  // 5-second Auto-Watch Timer
  useEffect(() => {
    if (filteredShorts.length === 0) return;
    const currentShort = filteredShorts[currentIndex];
    if (!currentShort) return;

    const timerId = setTimeout(async () => {
      if (!watchedSet.has(currentShort.id)) {
        try {
          await markShortWatchedAction(currentShort.id, userId);
          setWatchedSet(prev => {
            const newSet = new Set(prev);
            newSet.add(currentShort.id);
            return newSet;
          });
        } catch (error) {
          console.error("Failed to auto-mark as watched");
        }
      }
    }, 5000);

    return () => clearTimeout(timerId);
  }, [currentIndex, filteredShorts, watchedSet, userId]);

  const currentShortId = filteredShorts[currentIndex]?.id;

  // Auto-fetch comments and notes when video changes
  useEffect(() => {
    if (!currentShortId) return;

    let isMounted = true;
    setCommentsLoading(true);
    setLoadingNotes(true);
    
    Promise.all([
      getShortCommentsAction(currentShortId),
      getShortNoteAction(currentShortId, userId)
    ]).then(([commentsData, noteData]) => {
      if (isMounted) {
        setComments(commentsData);
        setCommentsLoading(false);
        setCurrentNotes(noteData?.content || "");
        setLoadingNotes(false);
      }
    }).catch(() => {
      if (isMounted) {
        setCommentsLoading(false);
        setLoadingNotes(false);
      }
    });

    return () => { isMounted = false; };
  }, [currentShortId, userId]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentIndex < filteredShorts.length - 1) {
          const nextIndex = currentIndex + 1;
          const targetEl = containerRef.current?.querySelector(`[data-index="${nextIndex}"]`);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentIndex > 0) {
          const prevIndex = currentIndex - 1;
          const targetEl = containerRef.current?.querySelector(`[data-index="${prevIndex}"]`);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, filteredShorts.length]);

  const handleToggleBookmark = async (shortId: string) => {
    try {
      const { bookmarked } = await toggleShortBookmarkAction(shortId, userId);
      setBookmarkedSet(prev => {
        const newSet = new Set(prev);
        if (bookmarked) newSet.add(shortId);
        else newSet.delete(shortId);
        return newSet;
      });
      toast.success(bookmarked ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch (e) {
      toast.error("Failed to update bookmark");
    }
  };

  const handleManualMarkWatched = async (shortId: string) => {
    if (watchedSet.has(shortId)) return;
    try {
      await markShortWatchedAction(shortId, userId);
      setWatchedSet(prev => {
        const newSet = new Set(prev);
        newSet.add(shortId);
        return newSet;
      });
      toast.success("Marked as watched!");
    } catch (e) {
      toast.error("Failed to mark as watched");
    }
  };

  const checkQuizAnswer = async (quizId: string, correctAnswer: string, shortId: string) => {
    const selected = quizAnswers[quizId];
    if (!selected) return;
    
    const isCorrect = selected === correctAnswer;
    setQuizResults(prev => ({ ...prev, [quizId]: isCorrect }));
    
    if (isCorrect) {
      toast.success("Correct answer!");
      if (!watchedSet.has(shortId)) {
        await handleManualMarkWatched(shortId);
      }
    } else {
      toast.error("Incorrect. Try again!");
    }
  };

  const loadCommentsMobile = () => {
    const event = new CustomEvent('open-mobile-comments');
    document.dispatchEvent(event);
  };

  const loadNotesMobile = () => {
    const event = new CustomEvent('open-mobile-notes');
    document.dispatchEvent(event);
  };

  const handleSaveNotes = async () => {
    if (!currentShortId) return;
    setIsSavingNotes(true);
    try {
      await saveShortNoteAction(currentShortId, userId, currentNotes);
      toast.success("Notes saved successfully");
    } catch (error) {
      toast.error("Failed to save notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeShort) return;
    setCommentSubmitting(true);
    try {
      await postShortCommentAction(activeShort.id, userId, commentText);
      setCommentText("");
      // reload
      const data = await getShortCommentsAction(activeShort.id);
      setComments(data);
      toast.success("Comment posted!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (initialShorts.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-white">
        <p>No shorts available yet.</p>
      </div>
    );
  }
  const activeShort = filteredShorts[currentIndex];

  return (
    <div className="w-full h-full flex flex-col bg-background" style={{ WebkitTapHighlightColor: "transparent" }}>
      
      {/* Top Bar: Search & Categories */}
      <div className="w-full z-40 p-4 border-b border-border bg-card/80 backdrop-blur-xl shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:max-w-xs shrink-0">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search shorts..." 
              className="w-full bg-background border border-border text-foreground placeholder:text-muted-foreground rounded-full pl-9 pr-4 py-2 text-sm outline-none focus:border-primary transition-all shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full scrollbar-none snap-x py-1">
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                onClick={() => setCategory(cat)}
                className={cn(
                  "snap-start shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm",
                  category === cat 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-background text-muted-foreground hover:bg-muted border border-border"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <Button asChild variant="outline" size="sm" className="shrink-0 bg-background hover:bg-muted border-border text-foreground rounded-full h-9 px-4 gap-2 shadow-sm">
            <Link href="/dashboard/shorts/saved">
              <Bookmark className="w-4 h-4 text-red-500 fill-red-500/20" />
              <span>Saved</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content Area: 3-Column Split View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Comments Panel (Desktop) */}
        <div className="hidden lg:flex w-[320px] xl:w-[400px] border-r border-border bg-card flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
          <div className="p-4 border-b border-border bg-card">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> Discussion
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Join the conversation about this short.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-background/50">
            {commentsLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground w-6 h-6" /></div>
            ) : comments.length === 0 ? (
              <div className="text-center text-muted-foreground mt-10 text-sm">No comments yet. Be the first!</div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold shrink-0 text-foreground">
                      {comment.user.avatarUrl ? (
                        <img src={comment.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        comment.user.name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 bg-card border border-border shadow-sm rounded-lg rounded-tl-none p-3 text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-foreground text-xs">{comment.user.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-card-foreground break-words text-[13px] leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={submitComment} className="p-4 border-t border-border bg-card flex gap-2">
            <Input 
              placeholder="Add your thoughts..." 
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
              disabled={commentSubmitting}
            />
            <Button type="submit" size="icon" disabled={!commentText.trim() || commentSubmitting} className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
              {commentSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>

        {/* Center Side: Video Feed */}
        <div className="flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-4 md:p-6 bg-muted/20">
          {filteredShorts.length === 0 ? (
            <div className="text-muted-foreground text-sm">No shorts match your search.</div>
          ) : (
            <div 
              ref={containerRef}
              className="w-full max-w-[400px] h-full sm:h-[90%] md:h-full sm:max-h-[850px] sm:aspect-[9/16] overflow-y-auto snap-y snap-mandatory scrollbar-none scroll-smooth rounded-2xl bg-black shadow-lg border border-border relative"
            >
            {filteredShorts.map((short, index) => {
              const isWatched = watchedSet.has(short.id);
              const isBookmarked = bookmarkedSet.has(short.id);
              const isActive = index === currentIndex;

              return (
                <div 
                  key={short.id} 
                  data-index={index}
                  className="short-item relative w-full h-full snap-start snap-always bg-black flex flex-col items-center justify-center overflow-hidden"
                >
                  {/* Video Area */}
                  {isActive ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${short.youtubeVideoId}?autoplay=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${short.youtubeVideoId}&playsinline=1`}
                      title={short.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full absolute inset-0 object-cover pointer-events-auto"
                    />
                  ) : (
                    <div className="relative w-full h-full absolute inset-0">
                      {short.thumbnailUrl && (
                        <img src={short.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover opacity-50" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-16 h-16 text-white/30" />
                      </div>
                    </div>
                  )}

                  {/* Bottom Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-16 p-5 pt-24 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none">
                    <div className="pointer-events-auto flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white drop-shadow-md">@{short.channelName}</span>
                        <Badge variant="neutral" className="bg-white/20 text-white hover:bg-white/30 border-0 text-[10px] backdrop-blur-md px-2 py-0.5">
                          {short.category}
                        </Badge>
                      </div>
                      <p className="text-white text-[15px] font-medium leading-snug line-clamp-2 drop-shadow-lg">{short.title}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {short.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-xs font-medium text-blue-300 drop-shadow-md">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Action Bar Overlay */}
                  <div className="absolute right-3 bottom-8 sm:bottom-12 flex flex-col items-center gap-5 pointer-events-auto z-10">
                    
                    {/* Bookmark */}
                    <button 
                      onClick={() => handleToggleBookmark(short.id)}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <div className="p-3 bg-black/50 backdrop-blur-md rounded-full group-hover:bg-black/80 transition-all group-active:scale-95">
                        {isBookmarked ? (
                          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                        ) : (
                          <Heart className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <span className="text-[11px] text-white font-semibold drop-shadow-md">Save</span>
                    </button>

                    {/* Notes (Mobile Only) */}
                    <button 
                      onClick={loadNotesMobile}
                      className="flex lg:hidden flex-col items-center gap-1.5 group relative mt-1"
                    >
                      <div className="p-3 bg-black/50 backdrop-blur-md rounded-full group-hover:bg-black/80 transition-all group-active:scale-95">
                        <PenLine className="w-6 h-6 text-white fill-white/20" />
                      </div>
                      <span className="text-[11px] text-white font-semibold drop-shadow-md">Notes</span>
                    </button>

                    {/* Comments (Mobile Only) */}
                    <button 
                      onClick={loadCommentsMobile}
                      className="flex lg:hidden flex-col items-center gap-1.5 group relative"
                    >
                      <div className="p-3 bg-black/50 backdrop-blur-md rounded-full group-hover:bg-black/80 transition-all group-active:scale-95">
                        <MessageSquare className="w-6 h-6 text-white fill-white/20" />
                      </div>
                      <span className="text-[11px] text-white font-semibold drop-shadow-md">Discuss</span>
                    </button>

                    {/* Watched */}
                    <button 
                      onClick={() => handleManualMarkWatched(short.id)}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <div className="p-3 bg-black/50 backdrop-blur-md rounded-full group-hover:bg-black/80 transition-all group-active:scale-95">
                        {isWatched ? (
                          <CheckCircle2 className="w-6 h-6 text-green-400 fill-green-400/20" />
                        ) : (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <span className="text-[11px] text-white font-semibold drop-shadow-md">Done</span>
                    </button>

                    {/* Quiz (If exists) */}
                    {short.quizzes && short.quizzes.length > 0 && (
                      <button 
                        onClick={() => setQuizOpen(true)}
                        className="flex flex-col items-center gap-1.5 group relative mt-1"
                      >
                        <div className="p-3 bg-primary/90 backdrop-blur-md rounded-full group-hover:bg-primary transition-all shadow-[0_0_20px_rgba(var(--primary),0.6)] group-active:scale-95">
                          <FileQuestion className="w-6 h-6 text-primary-foreground fill-primary-foreground/20" />
                        </div>
                        <span className="text-[11px] text-white font-semibold drop-shadow-md">Quiz</span>
                        
                        {/* Bouncing notification dot if not watched yet */}
                        {!isWatched && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full animate-bounce border-2 border-black" />
                        )}
                      </button>
                    )}

                    {/* Open External */}
                    <a 
                      href={`https://youtube.com/shorts/${short.youtubeVideoId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col items-center gap-1.5 group mt-3"
                    >
                      <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-full group-hover:bg-white/20 transition-all group-active:scale-95">
                        <ExternalLink className="w-5 h-5 text-white" />
                      </div>
                    </a>

                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>

        {/* Right Side: Notes Panel (Desktop) */}
        <div className="hidden lg:flex w-[320px] xl:w-[400px] border-l border-border bg-card flex-col h-full shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10">
          <div className="p-4 border-b border-border bg-card">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <PenLine className="w-5 h-5 text-primary" /> My Notes
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Take study notes directly while watching.</p>
          </div>
          
          <div className="flex-1 p-4 bg-background/50 relative">
            {loadingNotes ? (
              <div className="h-full flex items-center justify-center border border-border bg-muted/30">
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
              </div>
            ) : (
              <textarea 
                placeholder="Document your technical takeaways here..."
                value={currentNotes || ""}
                onChange={(e) => setCurrentNotes(e.target.value)}
                className="w-full h-full bg-background border border-border resize-none p-3 text-foreground placeholder:text-muted-foreground custom-scrollbar focus:outline-none focus:ring-1 focus:ring-primary text-sm shadow-inner"
              />
            )}
          </div>
          
          <div className="p-4 border-t border-border bg-card flex justify-end">
            <Button size="sm" className="rounded-none bg-primary hover:bg-primary-hover text-primary-foreground font-semibold uppercase tracking-wider text-xs" onClick={handleSaveNotes} disabled={loadingNotes || isSavingNotes}>
              {isSavingNotes ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <Save className="w-3 h-3 mr-1.5" />}
              Save Notes
            </Button>
          </div>
        </div>

      </div>

      {/* Quiz Modal */}
      {activeShort && activeShort.quizzes && activeShort.quizzes.length > 0 && (
        <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
          <DialogContent className="sm:max-w-md bg-zinc-950 text-white border-zinc-800">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-primary" />
                Knowledge Check
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Answer correctly to automatically mark this short as watched!
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 my-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {activeShort.quizzes.map((quiz: any, qIndex: number) => {
                const result = quizResults[quiz.id];
                return (
                  <div key={quiz.id} className="space-y-4 p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                    <h4 className="font-medium text-sm leading-relaxed">
                      {qIndex + 1}. {quiz.question}
                    </h4>
                    <div className="space-y-2">
                      {['A', 'B', 'C', 'D'].map((optKey) => {
                        const optValue = quiz[`option${optKey}`];
                        const isSelected = quizAnswers[quiz.id] === optKey;
                        const isCorrectAnswer = result === true && isSelected;
                        const isWrongAnswer = result === false && isSelected;
                        
                        return (
                          <div 
                            key={optKey}
                            onClick={() => {
                              if (result === true) return;
                              setQuizAnswers(prev => ({...prev, [quiz.id]: optKey}));
                            }}
                            className={cn(
                              "flex items-center space-x-3 p-3 border rounded-md transition-colors cursor-pointer text-sm",
                              result === true ? "cursor-not-allowed opacity-80" : "hover:bg-zinc-800",
                              isSelected ? "border-primary bg-primary/10" : "border-zinc-700",
                              isCorrectAnswer ? "border-green-500 bg-green-500/10" : "",
                              isWrongAnswer ? "border-red-500 bg-red-500/10" : ""
                            )}
                          >
                            <input 
                              type="radio" 
                              disabled={result === true}
                              name={`quiz-${quiz.id}`}
                              value={optKey} 
                              checked={isSelected}
                              readOnly
                              className="w-4 h-4 accent-primary"
                            />
                            <label className="flex-1 cursor-pointer">{optValue}</label>
                            {isCorrectAnswer && <Check className="w-4 h-4 text-green-500" />}
                            {isWrongAnswer && <X className="w-4 h-4 text-red-500" />}
                          </div>
                        );
                      })}
                    </div>
                    {result !== true && (
                      <Button 
                        size="sm" 
                        className="w-full mt-2" 
                        variant="secondary"
                        disabled={!quizAnswers[quiz.id]}
                        onClick={() => checkQuizAnswer(quiz.id, quiz.answer, activeShort.id)}
                      >
                        Check Answer
                      </Button>
                    )}
                    {result === true && quiz.explanation && (
                      <div className="mt-3 text-xs bg-green-500/10 text-green-400 p-3 rounded-md border border-green-500/20">
                        <span className="font-semibold block mb-1">Explanation:</span>
                        {quiz.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
          </DialogContent>
        </Dialog>
      )}

      {/* Mobile Comments Sheet */}
      <MobileCommentsSheet 
        comments={comments} 
        commentsLoading={commentsLoading} 
        submitComment={submitComment}
        commentText={commentText}
        setCommentText={setCommentText}
        commentSubmitting={commentSubmitting}
      />

      <MobileNotesSheet
        currentNotes={currentNotes}
        setCurrentNotes={setCurrentNotes}
        loadingNotes={loadingNotes}
        isSavingNotes={isSavingNotes}
        handleSaveNotes={handleSaveNotes}
      />

    </div>
  );
}

// Separate component for mobile notes sheet
function MobileNotesSheet({ currentNotes, setCurrentNotes, loadingNotes, isSavingNotes, handleSaveNotes }: any) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    document.addEventListener('open-mobile-notes', handleOpen);
    return () => document.removeEventListener('open-mobile-notes', handleOpen);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="w-full h-[80vh] bg-card border-border text-foreground p-0 flex flex-col rounded-t-2xl">
        <SheetHeader className="p-4 border-b border-border bg-card">
          <SheetTitle className="text-foreground flex items-center gap-2"><PenLine className="w-4 h-4 text-primary" /> My Notes</SheetTitle>
          <SheetDescription className="text-muted-foreground">Take study notes directly while watching.</SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 p-4 bg-background relative">
          {loadingNotes ? (
            <div className="h-full flex items-center justify-center border border-border bg-muted/30">
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <textarea 
              placeholder="Document your technical takeaways here..."
              value={currentNotes || ""}
              onChange={(e) => setCurrentNotes(e.target.value)}
              className="w-full h-full bg-card border border-border resize-none p-3 text-foreground placeholder:text-muted-foreground custom-scrollbar focus:outline-none focus:ring-1 focus:ring-primary text-sm shadow-inner"
            />
          )}
        </div>
        
        <div className="p-4 border-t border-border bg-card flex justify-end">
          <Button size="sm" className="rounded-none bg-primary hover:bg-primary-hover text-primary-foreground font-semibold uppercase tracking-wider text-xs" onClick={() => {
            handleSaveNotes();
            setOpen(false);
          }} disabled={loadingNotes || isSavingNotes}>
            {isSavingNotes ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <Save className="w-3 h-3 mr-1.5" />}
            Save & Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Separate component for mobile sheet to handle open state internally based on event
function MobileCommentsSheet({ comments, commentsLoading, submitComment, commentText, setCommentText, commentSubmitting }: any) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    document.addEventListener('open-mobile-comments', handleOpen);
    return () => document.removeEventListener('open-mobile-comments', handleOpen);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="w-full h-[80vh] bg-card border-border text-foreground p-0 flex flex-col rounded-t-2xl">
        <SheetHeader className="p-4 border-b border-border bg-card">
          <SheetTitle className="text-foreground flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" /> Discussion</SheetTitle>
          <SheetDescription className="text-muted-foreground">Join the conversation.</SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-background">
          {commentsLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground w-6 h-6" /></div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted-foreground mt-10 text-sm">No comments yet. Be the first!</div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold shrink-0 text-foreground">
                    {comment.user.avatarUrl ? (
                      <img src={comment.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      comment.user.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 bg-card border border-border rounded-lg rounded-tl-none p-3 text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-foreground text-xs">{comment.user.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-card-foreground break-words text-[13px] leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={submitComment} className="p-4 border-t border-border flex gap-2 bg-card">
          <Input 
            placeholder="Add a comment..." 
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            className="bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-primary"
            disabled={commentSubmitting}
          />
          <Button type="submit" size="icon" disabled={!commentText.trim() || commentSubmitting} className="shrink-0 bg-primary text-primary-foreground">
            {commentSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
