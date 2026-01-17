import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; 
import { getSearchEnabledModel } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Calendar, Film, Ticket } from "lucide-react";

// Web Component Wrapper for Google Search Attribution
const ShadowDomWrapper = ({ content, className }: { content: string; className?: string }) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const shadowRootRef = useRef<ShadowRoot | null>(null);

    useEffect(() => {
        if (hostRef.current && !shadowRootRef.current) {
            shadowRootRef.current = hostRef.current.attachShadow({ mode: "open" });
        }
        
        if (shadowRootRef.current) {
            if (shadowRootRef.current.innerHTML !== content) {
                shadowRootRef.current.innerHTML = content;
            }
        }
    }, [content]);

    return <div ref={hostRef} className={className} />;
};

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

export default function FindTheatresPage() {
    const [searchParams] = useSearchParams();
    const movieTitle = searchParams.get("title") || "";
    const tags = searchParams.getAll("tags") || "";

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
                    // Just basic coordinates, the AI handles the rest
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

            // Constructing a prompt for Gemini with Search Tools enabled
            const prompt = `
                Context: User wants to see the movie matching "${tags}" or "${movieTitle}" in a theatre.
                Location: ${location}
                Date: ${date}

                Task:
                1. Find if "${movieTitle}" is playing nearby.
                2. If not, find 2-3 similar movies currently playing in this city.
                3. Return strict JSON format.

                JSON Schema:
                {
                    "movies": [
                        {
                            "title": "Movie Title",
                            "isTargetMovie": boolean,
                            "description": "Short reasoning",
                            "theatres": [
                                { "name": "Cinema Name", "showtimes": ["7:00 PM", "9:30 PM"] }
                            ]
                        }
                    ]
                }
            `;

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });

            const response = result.response;
            const text = response.text();
            
            // Capture the grounding (attribution) metadata provided by Vertex AI
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
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-primary/10 rounded-full">
                    <Ticket className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Box Office Search</h1>
                    <p className="text-muted-foreground">
                        Find <span className="font-semibold text-foreground">{movieTitle}</span> or similar films near you.
                    </p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
                {/* Left Column: Search Form */}
                <div className="h-fit space-y-6">
                    <Card className="border-primary/20 shadow-lg">
                        <CardContent className="pt-6">
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="pl-9"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="City, Zip, or Address"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="pl-9"
                                                required
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={handleUseMyLocation}
                                            title="Use my location"
                                        >
                                            <MapPin className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Scanning...
                                        </>
                                    ) : (
                                        "Find Showtimes"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    
                    {/* Attribution Area (Required by Google for Grounding) */}
                    {groundingMetadata && (
                        <div className="text-xs text-muted-foreground space-y-3 p-4 bg-muted/30 rounded-lg">
                            {groundingMetadata.searchEntryPoint?.renderedContent && (
                                <ShadowDomWrapper 
                                    content={groundingMetadata.searchEntryPoint.renderedContent} 
                                />
                            )}
                            
                            {groundingMetadata.groundingChunks && (
                                <div className="flex flex-wrap gap-2">
                                    <span className="font-semibold">Sources:</span>
                                    {groundingMetadata.groundingChunks.map((chunk: any, i: number) => (
                                        chunk.web?.uri && (
                                            <a 
                                                key={i} 
                                                href={chunk.web.uri}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline hover:text-primary truncate max-w-[150px]"
                                            >
                                                {chunk.web.title || "Source"}
                                            </a>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: Results */}
                <div className="space-y-6">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-lg font-medium animate-pulse">
                                Scanning theatres in {location || 'your area'}...
                            </p>
                        </div>
                    )}

                    {!isLoading && movies.length === 0 && !error && (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/10">
                            <Film className="h-12 w-12 mb-4 opacity-20" />
                            <p>Enter a location to see what's playing.</p>
                        </div>
                    )}

                    {error && (
                         <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-center">
                            {error}
                         </div>
                    )}

                    {movies.map((movie, idx) => (
                        <Card key={idx} className="overflow-hidden border-border hover:border-primary/50 transition-colors">
                            <div className="p-6">
                                <div>
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-2xl font-bold flex items-center gap-2">
                                            <Film className="h-5 w-5 text-primary" />
                                            {movie.title}
                                        </h3>
                                        {movie.isTargetMovie ? (
                                            <Badge>Selected Movie</Badge>
                                        ) : (
                                            <Badge variant="secondary">Recommendation</Badge>
                                        )}
                                    </div>
                                    {movie.description && (
                                        <p className="text-muted-foreground mb-4 text-sm">
                                            {movie.description}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-4 mt-4">
                                    {movie.theatres.length > 0 ? (
                                        movie.theatres.map((theatre, tIdx) => (
                                            <div key={tIdx} className="bg-muted/30 p-3 rounded-lg border border-border/50">
                                                <div className="font-semibold mb-2 flex items-center text-primary">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {theatre.name}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {theatre.showtimes.map((time, timeIdx) => (
                                                        <Badge 
                                                            key={timeIdx} 
                                                            variant="outline" 
                                                            className="bg-background hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                                                        >
                                                            {time}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">
                                            No showtimes found nearby for this date.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
