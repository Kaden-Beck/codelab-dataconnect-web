import React, { useState } from 'react';
import { handleSearchMoviesFTS } from '@/lib/MovieService';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MoviePoster from "@/components/movie-poster";

export default function AdvancedSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!query) return;
    setLoading(true);
    setHasSearched(true);
    const data = await handleSearchMoviesFTS(query);
    setResults(data);
    setLoading(false);
  };

  const ResultSection = ({ title, description, movies }: any) => (
    <div className="space-y-4 mb-10">
        <div className="border-l-4 border-primary pl-4">
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        
        {!movies || movies.length === 0 ? (
            <div className="text-sm text-muted-foreground italic pl-4">No matches found using this method.</div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {movies.map((m: any) => (
                    <div key={m.id}>
                         <MoviePoster movie={m} size="small" />
                         <p className="mt-1 font-medium text-xs truncate">{m.title}</p>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Deep Search</h1>
        <p className="text-muted-foreground mb-8">
            Explore our Full-Text Search capabilities. See how different algorithms interpret your query.
        </p>
        
        <form onSubmit={onSearch} className="flex gap-2">
            <Input 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Try 'Space war', 'Hero saves world'..."
                className="h-12 text-lg"
            />
            <Button type="submit" size="lg" disabled={loading} className="h-12 px-8">
                {loading ? '...' : <Search className="w-5 h-5" />}
            </Button>
        </form>
      </div>

      {hasSearched && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ResultSection 
                title="Plain Search (OR Logic)" 
                description="Matches movies containing ANY of your words. Best for broad discovery."
                movies={results?.plain} 
            />
            <ResultSection 
                title="Phrase Search" 
                description="Matches the exact sequence of words. Good for specific quotes or titles."
                movies={results?.phrase} 
            />
            <ResultSection 
                title="Websearch Query" 
                description="Smart parsing that handles operators like + and -."
                movies={results?.query} 
            />
        </div>
      )}
    </div>
  );
}
