"use client";

import { useState, useEffect, useRef } from "react";
import { Search, LoaderCircle, BookOpen, PlaySquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchEntitiesAction, SearchResult } from "@/app/actions/search";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await searchEntitiesAction(query);
        setResults(res);
        setIsOpen(true);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search..."
          className="h-9 w-full rounded-lg border border-input bg-muted/55 pl-9 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        {isSearching && (
          <LoaderCircle className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute left-0 top-full z-50 mt-2 max-h-[400px] w-full overflow-y-auto rounded-xl border bg-popover py-1.5 text-popover-foreground shadow-[var(--shadow-lg)]">
          {results.length === 0 && !isSearching ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No results found for "{query}"</div>
          ) : (
            <ul className="flex flex-col">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    onClick={() => handleSelect(result.href)}
                    className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      {result.type === "course" ? <BookOpen className="h-3.5 w-3.5" /> : <PlaySquare className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-sm font-medium">{result.title}</span>
                      <span className="truncate text-xs text-muted-foreground">{result.subtitle}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
