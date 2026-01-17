import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { handleFTS } from '@/lib/MovieService';
import MoviePoster from '@/components/movie-poster';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from 'lucide-react';

export default function FullTextSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // The "source of truth" is the URL
  const query = searchParams.get('q') || '';
  
  // Local state for the input field on this page
  const [localQuery, setLocalQuery] = useState(query);
  
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Sync local input if the URL changes (e.g. from Header search)
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  // Fetch Data when URL query changes
  useEffect(() => {
    if (query) {
      setLoading(true);
      handleFTS(query).then(data => {
        setResults(data);
        setLoading(false);
      });
    }
  }, [query]);

  // Handle form submission on this page
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      // Update the URL, which triggers the useEffect above
      setSearchParams({ q: localQuery.trim() });
    }
  };

  const ResultRow = ({ title, description, movies }: { title: string, description: string, movies: any[] }) => {
    if (!movies || movies.length === 0) return null;
    return (
      <div className="mb-12">
        <div className="mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" /> {title}
            </h2>
            <p className="text-sm text-muted-foreground ml-7">{description}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map(m => <MoviePoster key={m.id} movie={m} size="small" />)}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Full-Text Search</h1>
      
      {/* Modification Input Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mb-10">
        <Input 
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Refine your search..."
            className="h-11 text-lg"
        />
        <Button type="submit" size="lg" className="h-11 px-8" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Search"}
        </Button>
      </form>

      {loading ? (
        <div className="flex flex-col gap-4 animate-pulse">
            <div className="h-8 w-1/3 bg-muted rounded"></div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => <div key={i} className="aspect-[2/3] bg-muted rounded-lg"></div>)}
            </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!results?.query.length && !results?.plain.length && !results?.phrase.length && (
             <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground">No matching movies found for "{query}".</p>
             </div>
          )}
          
          <ResultRow 
            title="Smart Matches" 
            description="Best for structured queries (e.g. 'Space -War')"
            movies={results?.query} 
          />
          
          <ResultRow 
            title="Exact Phrase Matches" 
            description="Matches the specific sequence of words"
            movies={results?.phrase} 
          />
          
          <ResultRow 
            title="Broad Matches" 
            description="Fuzzy matching for general discovery"
            movies={results?.plain} 
          />
        </div>
      )}
    </div>
  );
}
