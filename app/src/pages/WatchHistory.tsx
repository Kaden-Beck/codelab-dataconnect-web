import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/lib/firebase';
import { handleGetWatchHistory, handleDeleteWatch } from '@/lib/MovieService';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Film, Tv, Smartphone, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MoviePoster from '@/components/movie-poster';
import { format } from "date-fns";
import { toast } from "sonner";

export default function WatchHistoryPage() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [watches, setWatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    const data = await handleGetWatchHistory();
    setWatches(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!auth.currentUser) {
        navigate("/");
    } else if (auth.currentUser) {
        fetchHistory();
    }
  }, [auth.currentUser]);

  // FIX: Accept movieId and watchDate instead of 'id'
  const onDelete = async (movieId: string, watchDate: string) => {
    if(window.confirm("Remove this log?")) {
        try {
            await handleDeleteWatch(movieId);
            // Remove from local state using the same composite key logic
            setWatches(prev => prev.filter(w => 
                !(w.movie.id === movieId && w.watchDate === watchDate)
            ));
            toast.success("Watch removed");
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete.");
        }
    }
  };

  if (loading) return <div className="p-10 text-center">Loading history...</div>;

  const grouped = watches.reduce((acc: any, watch) => {
    const monthKey = watch.watchDate.substring(0, 7);
    if(!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(watch);
    return acc;
  }, {});

  const sortedMonths = Object.keys(grouped).sort().reverse();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Watch History</h1>

      {watches.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">You haven't logged any movies yet.</p>
            <Button className="mt-4" asChild><Link to="/browse">Browse Movies</Link></Button>
        </div>
      ) : (
        <div className="space-y-8">
            {sortedMonths.map(month => (
                <div key={month} className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                        <CalendarIcon className="w-4 h-4" />
                        {format(new Date(month + "-01"), "MMMM yyyy")}
                    </div>
                    
                    <div className="grid gap-3">
                        {grouped[month].map((watch: any) => (
                            // FIX: Use composite key for React Key
                            <Card key={`${watch.movie.id}-${watch.watchDate}`} className="overflow-hidden">
                                <CardContent className="p-0 flex items-center">
                                    <div className="w-16 h-24 flex-shrink-0">
                                        <MoviePoster movie={watch.movie} size="small" variant="minimal" className="h-full rounded-none" />
                                    </div>
                                    
                                    <div className="flex-1 px-4 py-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-sm text-muted-foreground font-mono mb-1">
                                                    {format(new Date(watch.watchDate), "MMM dd")}
                                                </div>
                                                <Link to={`/movie/${watch.movie.id}`} className="font-bold hover:underline block text-lg">
                                                    {watch.movie.title}
                                                </Link>
                                            </div>
                                            {/* FIX: Call onDelete with composite params */}
                                            <Button variant="ghost" size="icon" onClick={() => onDelete(watch.movie.id, watch.watchDate)} className="text-muted-foreground hover:text-destructive">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-3 mt-2">
                                            <Badge variant="outline" className="capitalize flex gap-1 items-center">
                                                {watch.format === 'home' && <Tv className="w-3 h-3" />}
                                                {watch.format === 'mobile' && <Smartphone className="w-3 h-3" />}
                                                {watch.format?.includes('theater') && <Film className="w-3 h-3" />}
                                                {watch.format?.replace('-', ' ')}
                                            </Badge>
                                            
                                            {watch.review && (
                                                <div className="text-xs flex items-center gap-1 text-yellow-500 font-bold">
                                                    ★ {watch.review.rating/2}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}