import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getSearchEnabledModel } from "../lib/firebase"; 
import { Loader2, MapPin, Calendar, Film, Ticket } from "lucide-react";

interface Theatre {
  name: string;
  showtimes: string[];
}

interface MovieResult {
  title: string;
  isTargetMovie: boolean;
  description: string;
  theatres: Theatre[];
}

const ShadowDomWrapper = ({ content, className }: { content: string; className?: string }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    if (hostRef.current && !shadowRootRef.current) {
      shadowRootRef.current = hostRef.current.attachShadow({ mode: "open" });
    }
    if (shadowRootRef.current && shadowRootRef.current.innerHTML !== content) {
      shadowRootRef.current.innerHTML = content;
      
      // Inject dark mode styles into shadow DOM for Google Search content
      const style = document.createElement('style');
      style.textContent = `
        * { color: #e5e7eb !important; } 
        a { color: #60a5fa !important; }
      `;
      shadowRootRef.current.appendChild(style);
    }
  }, [content]);

  return <div ref={hostRef} className={className} />;
};

export default function FindTheatresPage() {
  const [searchParams] = useSearchParams();
  const movieTitle = searchParams.get("title") || "";
  const tags = searchParams.getAll("tags").join(", ") || "";

  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [movies, setMovies] = useState<MovieResult[]>([]);
  const [groundingMetadata, setGroundingMetadata] = useState<any>(null);
  const [error, setError] = useState("");

  const handleUseMyLocation = () => {
    if ("geolocation" in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
          setIsLoading(false);
        },
        (err) => {
          console.error(err);
          setIsLoading(false);
        }
      );
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !date) return;
    setIsLoading(true);
    setMovies([]);
    setError("");
    setGroundingMetadata(null);

    try {
      const model = getSearchEnabledModel();

      const prompt = `
            Context: User wants to see the movie matching "${tags || movieTitle}" in a theatre.
            Location: ${location}
            Date: ${date}

            Task:
            1. Find 2-3 movies similar to "${tags || movieTitle}" currently playing in this city.
            2. Return strict JSON format.

            JSON Schema:
            {
                "movies": [
                    {
                        "title": "Movie Title",
                        "description": "Movie description",
                        "isTargetMovie": true,
                        "theatres": [
                            { "name": "Cinema Name", "showtimes": ["7:00 PM", "9:30 PM"] }
                        ]
                    }
                ]
            }
        `;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const response = result.response;
      const text = response.text();

      setGroundingMetadata(response.candidates?.[0]?.groundingMetadata);

      const cleanJson = text.replace(/```json|```/g, "").trim();
      const data = JSON.parse(cleanJson);

      if (data.movies && Array.isArray(data.movies)) {
        setMovies(data.movies);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Search Error:", err);
      setError("Could not find showtimes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-blue-900/30 rounded-full border border-blue-800">
            <Ticket className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Box Office Search</h1>
            <p className="text-gray-400">
              Find <span className="font-semibold text-white">{movieTitle || "movies"}</span> or similar films near you.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
          {/* Left Column: Search Form */}
          <div className="h-fit space-y-6">
            <div className="rounded-xl border border-gray-700 bg-gray-800 shadow-lg">
              <div className="p-6 pt-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 pl-9 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Location
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          placeholder="City, Zip, or Address"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 pl-9 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleUseMyLocation}
                        title="Use my location"
                        className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600 h-10 w-10 transition-colors"
                      >
                        <MapPin className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center justify-center w-full rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 h-10 px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      "Find Showtimes"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                <p className="text-lg font-medium animate-pulse text-gray-400">
                  Scanning theatres in {location || 'your area'}...
                </p>
              </div>
            )}

            {!isLoading && movies.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-700 rounded-xl text-gray-500 bg-gray-800/50">
                <Film className="h-12 w-12 mb-4 opacity-20" />
                <p>Enter a location to see what's playing.</p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-900 text-red-400 text-center">
                {error}
              </div>
            )}

            {movies.map((movie, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-700 bg-gray-800 text-white shadow-lg overflow-hidden hover:border-blue-500/50 transition-colors"
              >
                <div className="p-6">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-2xl font-bold flex items-center gap-2">
                        <Film className="h-5 w-5 text-blue-500" />
                        {movie.title}
                      </h3>
                      {movie.isTargetMovie ? (
                        <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
                          Selected Movie
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-gray-600 bg-gray-700 px-2.5 py-0.5 text-xs font-semibold text-gray-300">
                          Recommendation
                        </span>
                      )}
                    </div>
                    {movie.description && (
                      <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                        {movie.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4 mt-4">
                    {movie.theatres && movie.theatres.length > 0 ? (
                      movie.theatres.map((theatre, tIdx) => (
                        <div
                          key={tIdx}
                          className="bg-gray-700/50 p-4 rounded-lg border border-gray-700"
                        >
                          <div className="font-semibold mb-3 flex items-center text-blue-400">
                            <MapPin className="w-4 h-4 mr-2" />
                            {theatre.name}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {theatre.showtimes.map((time, timeIdx) => (
                              <span
                                key={timeIdx}
                                className="inline-flex items-center rounded-md border border-gray-600 bg-gray-800 px-3 py-1 text-sm font-medium text-gray-200 hover:bg-blue-600 hover:border-blue-600 hover:text-white cursor-pointer transition-colors"
                              >
                                {time}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic pl-1">
                        No showtimes found nearby for this date.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}