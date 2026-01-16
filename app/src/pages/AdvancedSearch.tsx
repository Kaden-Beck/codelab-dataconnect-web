import React, { useState } from 'react';
import { handleSearchMoviesFTS } from '@/lib/MovieService';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

export default function AdvancedSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!query) return;
    setLoading(true);
    const data = await handleSearchMoviesFTS(query);
    setResults(data);
    setLoading(false);
  };

  const ResultSection = ({ title, desc, movies }: any) => (
    <div className="mb-8">
        <h3 className="text-xl font-bold text-blue-400">{title}</h3>
        <p className="text-sm text-gray-400 mb-4">{desc}</p>
        {(!movies || movies.length === 0) ? (
            <p className="italic text-gray-600">No results.</p>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {movies.map((m: any) => (
                    <Link key={m.id} to={`/movie/${m.id}`} className="block">
                         <img src={m.posterUrl} alt={m.title} className="rounded shadow-lg w-full" />
                         <p className="mt-1 font-bold text-sm truncate">{m.title}</p>
                    </Link>
                ))}
            </div>
        )}
    </div>
  );

  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Full-Text Search</h1>
        
        <form onSubmit={onSearch} className="flex gap-2 mb-12">
            <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Try 'Space war', 'Hero saves world', or specific phrases..."
                className="flex-1 p-4 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500 outline-none"
            />
            <button type="submit" disabled={loading} className="bg-blue-600 px-8 rounded font-bold hover:bg-blue-700 transition">
                {loading ? '...' : <FaSearch />}
            </button>
        </form>

        {results && (
            <div className="space-y-8 animate-fade-in">
                <ResultSection 
                    title="Plain Search (OR)" 
                    desc="Matches any word in your query. Good for broad discovery."
                    movies={results.plain} 
                />
                <div className="border-t border-gray-800" />
                <ResultSection 
                    title="Phrase Search" 
                    desc="Matches the exact sequence of words."
                    movies={results.phrase} 
                />
                <div className="border-t border-gray-800" />
                <ResultSection 
                    title="Query String" 
                    desc="Supports operators (+, -, etc)."
                    movies={results.query} 
                />
            </div>
        )}
      </div>
    </div>
  );
}
