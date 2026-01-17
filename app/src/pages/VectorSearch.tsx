import React, { useState } from 'react';
import { handleVectorSearch } from '@/lib/MovieService';
import MoviePoster from '@/components/movie-poster';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from 'lucide-react';

export default function VectorSearchPage() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const results = await handleVectorSearch(query);
    setMovies(results || []);
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Sparkles className="text-yellow-500" /> Vector Search
        </h1>
        <p className="text-muted-foreground mb-8">
          Describe the <em>vibe</em>, plot, or feeling of the movie you want. 
          <br/>Ex: "A sad movie about space travel" or "Cowboys fighting aliens".
        </p>
        
        <form onSubmit={onSearch} className="flex gap-2 max-w-xl mx-auto">
          <Input 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Describe your movie..."
            className="h-12 text-lg"
          />
          <Button type="submit" size="lg" className="h-12 px-8" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Find"}
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map(movie => (
          <div key={movie.id} className="space-y-2">
            <MoviePoster movie={movie} />
            <p className="text-xs text-muted-foreground line-clamp-3">{movie.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
