"use client";

import { useState, useEffect } from "react";
import { searchShortsAction, approveShortAction, rejectShortAction, getAutoFeedSuggestionsAction } from "@/actions/shorts";
import { YouTubeShortSnippet } from "@/lib/youtube";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Search, Check, X, Tag } from "lucide-react";
import Image from "next/image";

const CATEGORIES = [
  "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", 
  "Git", "Docker", "Linux", "Database", "AI", "DevOps", "Cybersecurity", "Other"
];

export function ShortsAdminPanel({ adminId }: { adminId: string }) {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<YouTubeShortSnippet[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isAutoFeed, setIsAutoFeed] = useState(false);
  const [autoKeyword, setAutoKeyword] = useState("");

  // States for approval
  const [selectedCategory, setSelectedCategory] = useState<Record<string, string>>({});
  const [selectedScore, setSelectedScore] = useState<Record<string, number>>({});


  useEffect(() => {
    async function loadAutoFeed() {
      setLoading(true);
      try {
        const { keyword: kw, shorts } = await getAutoFeedSuggestionsAction();
        setAutoKeyword(kw);
        setIsAutoFeed(true);
        setResults(shorts);
        
        const defaultCats: Record<string, string> = {};
        const defaultScores: Record<string, number> = {};
        shorts.forEach((v: any) => {
          defaultCats[v.videoId] = "Other";
          defaultScores[v.videoId] = 5;
        });
        setSelectedCategory(defaultCats);
        setSelectedScore(defaultScores);
      } catch (error) {
        console.error("Auto-feed failed", error);
      } finally {
        setLoading(false);
      }
    }
    loadAutoFeed();
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setIsAutoFeed(false);
    try {
      const data = await searchShortsAction(keyword);
      setResults(data);
      // default categories
      const defaultCats: Record<string, string> = {};
      const defaultScores: Record<string, number> = {};
      data.forEach(v => {
        defaultCats[v.videoId] = "Other";
        defaultScores[v.videoId] = 5;
      });
      setSelectedCategory(defaultCats);
      setSelectedScore(defaultScores);
    } catch (error: any) {
      toast.error(error.message || "Failed to search.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(video: YouTubeShortSnippet) {
    const category = selectedCategory[video.videoId] || "Other";
    const score = selectedScore[video.videoId] ?? 5;
    try {
      await approveShortAction(video, category, [category.toLowerCase()], score, adminId);
      toast.success("Short approved successfully!");
      setResults(results.filter(r => r.videoId !== video.videoId));
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function handleReject(video: YouTubeShortSnippet) {
    try {
      await rejectShortAction(video, adminId);
      toast.success("Short rejected.");
      setResults(results.filter(r => r.videoId !== video.videoId));
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <Card className="w-full sm:w-auto flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><Search className="w-5 h-5"/> Manual Search</CardTitle>
          </CardHeader>
          <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input 
                placeholder="e.g. React tips, Python tricks, VS Code shortcuts..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Search
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>

      {isAutoFeed && results.length > 0 && !hasSearched && (
        <div className="mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">✨</span> Daily Discovery: <span className="text-primary">{autoKeyword}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Automatically curated high-quality shorts for you to approve today.</p>
        </div>
      )}

      {hasSearched && !isAutoFeed && results.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-bold">Search Results for "{keyword}"</h2>
        </div>
      )}

      {hasSearched && results.length === 0 && !loading && (
        <div className="text-center p-12 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground">No new shorts found. They might already be in the database or the keyword returned no embeddable shorts under 60 seconds.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((video) => (
            <Card key={video.videoId} className="flex flex-col overflow-hidden">
              <div className="relative aspect-video w-full bg-black">
                <iframe 
                  src={`https://www.youtube-nocookie.com/embed/${video.videoId}`} 
                  title={video.title}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="secondary" className="bg-black/70 text-white border-0">{video.durationSeconds}s</Badge>
                </div>
              </div>
              
              <CardContent className="p-4 flex-1">
                <h3 className="font-semibold line-clamp-2 text-sm mb-2" title={video.title}>{video.title}</h3>
                <p className="text-xs text-muted-foreground mb-4">{video.channelTitle}</p>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium flex items-center gap-1"><Tag className="h-3 w-3" /> Category</label>
                  <Select 
                    value={selectedCategory[video.videoId] || ""} 
                    onChange={(e) => setSelectedCategory(prev => ({...prev, [video.videoId]: e.target.value}))}
                  >
                    <option value="" disabled>Select category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-xs font-medium flex items-center gap-1">Score (Points)</label>
                  <Input 
                    type="number"
                    min="1"
                    max="100"
                    className="h-8 text-xs"
                    value={selectedScore[video.videoId] ?? 5}
                    onChange={(e) => setSelectedScore(prev => ({...prev, [video.videoId]: parseInt(e.target.value) || 5}))}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0 gap-2">
                <Button variant="outline" className="flex-1" size="sm" onClick={() => handleReject(video)}>
                  <X className="mr-1 h-3 w-3" /> Reject
                </Button>
                <Button className="flex-1" size="sm" onClick={() => handleApprove(video)}>
                  <Check className="mr-1 h-3 w-3" /> Approve
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
