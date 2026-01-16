import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export interface Movie {
  id: string;
  title: string;
  rating: string;
  posterUrl: string;
  releaseDate: string;
  genre: string;
  stats?: {
    avgRating?: number | null;
    watchCount?: number | null;
    reviewCount?: number | null;
  };
}

interface MoviePosterProps {
  movie: Movie;
  variant?: "default" | "minimal";
  size?: "small" | "medium" | "full";
  className?: string;
}

export default function MoviePoster({
  movie,
  variant = "default",
  size = "medium",
  className,
}: MoviePosterProps) {
  // Logic to handle image resizing via URL manipulation
  const getPosterSizeUrl = (url: string, s: string) => {
    if (!url) return "";
    if (s === "small") return url.replace(".jpg", "-300x400.jpg");
    if (s === "medium") return url.replace(".jpg", "-600x800.jpg");
    return url;
  };

  const displayUrl = getPosterSizeUrl(movie.posterUrl, size);

  return (
    <Link to={`/movie/${movie.id}`} className={cn("group block relative", className)}>
      <div className={cn(
        "relative overflow-hidden bg-muted",
        size === "small" ? "rounded-md" : "rounded-lg",
        "aspect-[2/3] w-full"
      )}>
        <img
          src={displayUrl}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {variant === "default" && movie.stats?.avgRating && (
          <div className="absolute bottom-2 right-2 z-10">
             <Badge variant="secondary" className="bg-black/60 backdrop-blur-sm text-white hover:bg-black/70 border-0 flex gap-1">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                {(movie.stats.avgRating / 2).toFixed(1)}
             </Badge>
          </div>
        )}
      </div>
    </Link>
  );
}
