import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { handleBrowseMovies } from '@/lib/MovieService';
import { MdStar, MdFilterList } from 'react-icons/md';

const GENRES = ["Action", "Adventure", "Comedy", "Drama", "Thriller", "Sci-Fi", "Horror", "Rom-Com", "Mystery", "Western", "Animation", "Musical"];

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Local state for filters
  const [filters, setFilters] = useState({
    title: searchParams.get('title') || '',
    minYear: searchParams.get('minYear') || '',
    maxYear: searchParams.get('maxYear') || '',
    minRating: Number(searchParams.get('minRating')) || 0,
    genres: searchParams.get('genres') ? searchParams.get('genres')?.split(',') : [] as string[]
  });

  // Fetch when filters change
  useEffect(() => {
    setLoading(true);
    handleBrowseMovies(filters).then(data => {
        setMovies(data?.movies || []);
        setLoading(false);
    });

    // Update URL to match state
    const params: any = {};
    if (filters.title) params.title = filters.title;
    if (filters.minYear) params.minYear = filters.minYear;
    if (filters.maxYear) params.maxYear = filters.maxYear;
    if (filters.minRating > 0) params.minRating = filters.minRating.toString();
    if (filters.genres.length > 0) params.genres = filters.genres.join(',');
    setSearchParams(params);

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
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen text-white flex flex-col md:flex-row gap-6">
      
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0 bg-gray-800 p-4 rounded-lg h-fit">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><MdFilterList /> Filters</h2>
        
        <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input 
                type="text" 
                value={filters.title}
                onChange={(e) => setFilters({...filters, title: e.target.value})}
                className="w-full bg-gray-700 rounded p-2 text-white"
                placeholder="Search..."
            />
        </div>

        <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Year Range</label>
            <div className="flex gap-2">
                <input 
                    type="number" placeholder="Min"
                    value={filters.minYear}
                    onChange={(e) => setFilters({...filters, minYear: e.target.value})}
                    className="w-1/2 bg-gray-700 rounded p-2 text-white"
                />
                <input 
                    type="number" placeholder="Max"
                    value={filters.maxYear}
                    onChange={(e) => setFilters({...filters, maxYear: e.target.value})}
                    className="w-1/2 bg-gray-700 rounded p-2 text-white"
                />
            </div>
        </div>

        <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Min Rating ({filters.minRating} Stars)</label>
            <div className="flex gap-1">
                {[1,2,3,4,5].map(star => (
                    <button 
                        key={star}
                        onClick={() => setFilters({...filters, minRating: filters.minRating === star ? 0 : star})}
                        className={`text-2xl ${filters.minRating >= star ? 'text-yellow-500' : 'text-gray-600'}`}
                    >
                        ★
                    </button>
                ))}
            </div>
        </div>

        <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Genres</label>
            <div className="space-y-1 h-48 overflow-y-auto pr-2">
                {GENRES.map(g => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 p-1 rounded">
                        <input 
                            type="checkbox" 
                            checked={filters.genres.includes(g)}
                            onChange={() => toggleGenre(g)}
                        />
                        <span className="text-sm">{g}</span>
                    </label>
                ))}
            </div>
        </div>
        
        <button 
            onClick={() => setFilters({title: '', minYear: '', maxYear: '', minRating: 0, genres: []})}
            className="w-full border border-gray-600 hover:bg-gray-700 py-2 rounded text-sm transition"
        >
            Reset Filters
        </button>
      </aside>

      {/* Movie Grid */}
      <main className="flex-1">
        <h1 className="text-3xl font-bold mb-6">Browse Movies</h1>
        {loading ? (
            <p>Loading...</p>
        ) : movies.length === 0 ? (
            <div className="text-center py-20 bg-gray-800 rounded-lg text-gray-400">
                No movies found matching your criteria.
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {movies.map(movie => (
                    <Link key={movie.id} to={`/movie/${movie.id}`} className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition duration-200">
                        
                        <img src={movie.posterUrl} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
                        <div className="p-3">
                            <h3 className="font-bold truncate text-white">{movie.title}</h3>
                            <div className="flex justify-between items-center text-sm text-gray-400 mt-1">
                                <span>{new Date(movie.releaseDate).getFullYear()}</span>
                                <span>{movie.genre}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        )}
      </main>
    </div>
  );
}
