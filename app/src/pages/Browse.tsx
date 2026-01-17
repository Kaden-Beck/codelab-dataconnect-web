import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { handleBrowseMovies } from '@/lib/MovieService';
import MoviePoster from '@/components/movie-poster';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, X } from "lucide-react";

const GENRES = ["Action", "Adventure", "Comedy", "Drama", "Thriller", "Sci-Fi", "Horror", "Rom-Com", "Mystery", "Western", "Animation", "Musical"];

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Initialize filters from URL
  const [filters, setFilters] = useState({
    title: searchParams.get('title') || '',
    minYear: searchParams.get('minYear') || '',
    maxYear: searchParams.get('maxYear') || '',
    minRating: Number(searchParams.get('minRating')) || 0,
    genres: searchParams.get('genres') ? searchParams.get('genres')?.split(',') : [] as string[]
  });

  // Data Fetching
  useEffect(() => {
    setLoading(true);
    handleBrowseMovies(filters).then(data => {
        setMovies(data?.movies || []);
        setLoading(false);
    });

    // Update URL without reloading
    const params: any = {};
    if (filters.title) params.title = filters.title;
    if (filters.minYear) params.minYear = filters.minYear;
    if (filters.maxYear) params.maxYear = filters.maxYear;
    if (filters.minRating > 0) params.minRating = filters.minRating.toString();
    if (filters.genres.length > 0) params.genres = filters.genres.join(',');
    setSearchParams(params, { replace: true });

  }, [filters]);

  const toggleGenre = (genre: string) => {
    setFilters(prev => ({
        ...prev,
        genres: prev.genres.includes(genre) 
            ? prev.genres.filter(g => g !== genre)
            : [...prev.genres, genre]
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Browse Movies</h1>
        <Button variant="outline" className="md:hidden" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className={`w-full md:w-64 flex-shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <Card>
            <CardContent className="p-4 space-y-6">
                <div>
                    <Label className="mb-2 block">Search Title</Label>
                    <Input 
                        placeholder="e.g. Star Wars" 
                        value={filters.title}
                        onChange={(e) => setFilters({...filters, title: e.target.value})}
                    />
                </div>

                <div>
                    <Label className="mb-2 block">Year Range</Label>
                    <div className="flex gap-2">
                        <Input 
                            type="number" placeholder="Min" 
                            value={filters.minYear}
                            onChange={(e) => setFilters({...filters, minYear: e.target.value})}
                        />
                        <Input 
                            type="number" placeholder="Max" 
                            value={filters.maxYear}
                            onChange={(e) => setFilters({...filters, maxYear: e.target.value})}
                        />
                    </div>
                </div>

                <div>
                    <Label className="mb-2 block">Min Rating: {filters.minRating / 2} Stars</Label>
                    <div className="flex gap-1">
                        {[2, 4, 6, 8, 10].map((val) => (
                            <button
                                key={val}
                                onClick={() => setFilters({...filters, minRating: filters.minRating === val ? 0 : val})}
                                className={`w-6 h-6 rounded-full border text-xs flex items-center justify-center transition-colors ${filters.minRating >= val ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                            >
                                {val/2}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <Label className="mb-2 block">Genres</Label>
                    <div className="space-y-2 h-48 overflow-y-auto pr-2">
                        {GENRES.map(g => (
                            <div key={g} className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id={`genre-${g}`}
                                    className="rounded border-gray-300"
                                    checked={filters.genres.includes(g)}
                                    onChange={() => toggleGenre(g)}
                                />
                                <Label htmlFor={`genre-${g}`} className="font-normal cursor-pointer">{g}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => setFilters({title: '', minYear: '', maxYear: '', minRating: 0, genres: []})}
                >
                    Reset Filters
                </Button>
            </CardContent>
          </Card>
        </aside>

        {/* Results */}
        <div className="flex-1">
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg"></div>
                    ))}
                </div>
            ) : movies.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-lg">
                    No movies found matching your filters.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
                    {movies.map(movie => (
                        <div key={movie.id} className="space-y-2">
                            <MoviePoster movie={movie} />
                            <div>
                                <h3 className="font-medium text-sm leading-tight line-clamp-1">{movie.title}</h3>
                                <p className="text-xs text-muted-foreground">{new Date(movie.releaseDate).getFullYear()} • {movie.genre}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
