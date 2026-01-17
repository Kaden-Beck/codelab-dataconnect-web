import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { handleGetHomePageData } from "@/lib/MovieService";
import MoviePoster from "@/components/movie-poster";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const homeData = await handleGetHomePageData();
      setData(homeData);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-8 space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[200px] h-[300px] bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-10 text-center">Failed to load content.</div>;

  return (
    <div className="container mx-auto p-6 space-y-12">
      {/* Hero / New Releases */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">New Releases</h2>
          <Button variant="ghost" asChild>
            <Link to="/browse">View All</Link>
          </Button>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
          {data.newReleases.map((movie: any) => (
            <div key={movie.id} className="w-[180px] md:w-[240px] flex-shrink-0">
              <MoviePoster movie={movie} size="medium" />
              <h3 className="mt-3 font-semibold truncate">{movie.title}</h3>
              <p className="text-sm text-muted-foreground">{new Date(movie.releaseDate).getFullYear()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Rated */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-6">Top Rated</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {data.topMovies.map((stat: any) => (
            <div key={stat.movie.id}>
              <MoviePoster movie={stat.movie} size="medium" />
              <div className="flex items-center justify-between mt-2">
                <span className="font-medium truncate text-sm">{stat.movie.title}</span>
                <div className="flex items-center text-yellow-500 text-xs font-bold">
                  <Star className="w-3 h-3 fill-current mr-1" />
                  {(stat.avgRating / 2).toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Reviews */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-6">Recent Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.recentReviews.map((review: any) => (
            <Card key={review.id} className="bg-muted/50 border-none">
              <CardContent className="p-4 flex gap-4">
                <div className="w-16 flex-shrink-0">
                   <MoviePoster movie={review.movie} size="small" variant="minimal" className="w-16 rounded" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <Link to={`/movie/${review.movie.id}`} className="font-semibold hover:underline line-clamp-1">
                      {review.movie.title}
                    </Link>
                    <Badge variant="outline" className="flex gap-1">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      {(review.rating / 2).toFixed(1)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">"{review.review}"</p>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px]">{review.user.username[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{review.user.username}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
