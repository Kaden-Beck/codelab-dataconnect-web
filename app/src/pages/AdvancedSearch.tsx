import React, { useState } from 'react';
import { handleAdvancedSearch } from '@/lib/MovieService';
import MoviePoster from '@/components/movie-poster';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function AdvancedSearchPage() {
  const [filters, setFilters] = useState({
    input: '',
    minYear: 1980,
    maxYear: 2030,
    minRating: 0,
    genre: 'All'
  });
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = await handleAdvancedSearch(
      filters.input,
      filters.minYear,
      filters.maxYear,
      filters.minRating,
      filters.genre
    );
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Advanced Search</h1>
      
      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        {/* Filters Panel */}
        <Card className="h-fit">
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <Label>Keywords (Title/Actor)</Label>
                <Input 
                  value={filters.input}
                  onChange={e => setFilters({...filters, input: e.target.value})}
                  placeholder="e.g. Star"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Min Year</Label>
                  <Input type="number" value={filters.minYear} onChange={e => setFilters({...filters, minYear: Number(e.target.value)})} />
                </div>
                <div>
                  <Label>Max Year</Label>
                  <Input type="number" value={filters.maxYear} onChange={e => setFilters({...filters, maxYear: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <Label>Min Rating (0-10)</Label>
                <Input type="number" max={10} value={filters.minRating} onChange={e => setFilters({...filters, minRating: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Genre</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={filters.genre}
                  onChange={e => setFilters({...filters, genre: e.target.value})}
                >
                  <option value="All">All Genres</option>
                  <option value="sci-fi">Sci-Fi</option>
                  <option value="action">Action</option>
                  <option value="drama">Drama</option>
                  <option value="horror">Horror</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Searching..." : "Apply Filters"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-8">
          {results?.movies?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Movies ({results.movies.length})</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {results.movies.map((m: any) => <MoviePoster key={m.id} movie={m} size="small" />)}
              </div>
            </section>
          )}

          {results?.actors?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Actors ({results.actors.length})</h2>
              <div className="flex gap-4 flex-wrap">
                {results.actors.map((a: any) => (
                  <div key={a.id} className="text-center">
                    <Avatar className="w-20 h-20 mb-2">
                      <AvatarImage src={a.imageUrl} className="object-cover" />
                      <AvatarFallback>{a.name[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-medium">{a.name}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {results && !results.movies.length && !results.actors.length && (
             <div className="text-center py-10 text-muted-foreground">No matches found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
