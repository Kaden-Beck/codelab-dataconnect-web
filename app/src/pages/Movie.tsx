import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "@/lib/firebase";
import { handleGetMovieById } from "@/lib/MovieService";
import WatchDialog from "@/components/watch-dialog";
import MoviePoster from "@/components/movie-poster";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Star, User } from "lucide-react";

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const auth = useContext(AuthContext);
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      handleGetMovieById(id).then((data) => {
        setMovie(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div className="p-10 text-center animate-pulse">Loading movie details...</div>;
  if (!movie) return <div className="p-10 text-center">Movie not found</div>;

  const releaseYear = new Date(movie.releaseDate).getFullYear();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        
        {/* Sidebar / Poster */}
        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden border shadow-lg">
             <MoviePoster movie={movie} size="full" variant="minimal" />
          </div>
          
          {auth.currentUser ? (
            <WatchDialog movie={movie} />
          ) : (
            <div className="text-sm text-muted-foreground text-center bg-muted p-3 rounded">
              Sign in to log this movie
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-4 text-muted-foreground">
              <Badge variant="outline" className="border-primary/50 text-primary">{movie.rating}</Badge>
              <span className="flex items-center gap-1 text-sm"><Calendar className="w-4 h-4" /> {releaseYear}</span>
              <span className="flex items-center gap-1 text-sm"><Clock className="w-4 h-4" /> {movie.genre}</span>
              {movie.stats?.avgRating && (
                <span className="flex items-center gap-1 text-sm text-yellow-500 font-bold">
                  <Star className="w-4 h-4 fill-current" /> {(movie.stats.avgRating / 2).toFixed(1)}
                </span>
              )}
            </div>
          </div>

          <p className="text-lg leading-7 text-muted-foreground">
            {movie.description || "No description available."}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {movie.tags?.map((tag: string) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>

          <div className="my-8 border-t" />

          {/* Cast */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Top Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {movie.roles?.map((role: any) => (
                <Card key={role.actor.id} className="overflow-hidden border-none shadow-none bg-transparent">
                  <CardContent className="p-0 text-center space-y-2">
                    <Avatar className="w-20 h-20 mx-auto">
                        <AvatarImage src={role.actor.imageUrl} className="object-cover" />
                        <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-semibold text-sm">{role.actor.name}</div>
                        <div className="text-xs text-muted-foreground">{role.character}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <div className="my-8 border-t" />

          {/* Reviews */}
          <section>
             <h2 className="text-2xl font-bold mb-6">User Reviews</h2>
             <div className="space-y-4">
                {movie.reviews?.length === 0 && <p className="text-muted-foreground italic">No reviews yet. Be the first!</p>}
                
                {movie.reviews?.map((review: any) => (
                    <Card key={review.id}>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">{review.user.username[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold text-sm">{review.user.username}</span>
                                </div>
                                <div className="flex text-yellow-500">
                                    {Array.from({length: 5}).map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < review.rating/2 ? 'fill-current' : 'text-muted'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{review.review}</p>
                        </CardContent>
                    </Card>
                ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
