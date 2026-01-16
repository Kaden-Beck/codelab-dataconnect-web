import React, { useEffect, useState } from 'react';
import Carousel from '@/components/carousel';
import { handleGetHomePageData } from '@/lib/MovieService';
import { Link } from 'react-router-dom';
import { MdStar } from 'react-icons/md';

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

  if (loading) return <div className="p-10 text-white">Loading content...</div>;
  if (!data) return <div className="p-10 text-white">Failed to load content.</div>;

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen">
      
      {/* New Releases Carousel */}
      
      <section className="mb-10">
        <h2 className="text-3xl font-bold mb-4 border-l-4 border-yellow-500 pl-4">New Releases</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.newReleases.map((movie: any) => (
                <Link key={movie.id} to={`/movie/${movie.id}`} className="block group">
                    <img src={movie.posterUrl} alt={movie.title} className="rounded-lg shadow-lg group-hover:opacity-80 transition" />
                    <h3 className="mt-2 font-bold truncate">{movie.title}</h3>
                    <p className="text-sm text-gray-400">{new Date(movie.releaseDate).getFullYear()}</p>
                </Link>
            ))}
        </div>
      </section>

      {/* Top Rated Movies */}
      <section className="mb-10">
        <h2 className="text-3xl font-bold mb-4 border-l-4 border-yellow-500 pl-4">Top Rated</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {data.topMovies.map((stat: any) => (
                <Link key={stat.movie.id} to={`/movie/${stat.movie.id}`} className="block group">
                     <div className="relative">
                        <img src={stat.movie.posterUrl} alt={stat.movie.title} className="rounded-lg shadow-lg" />
                        <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded flex items-center">
                            <MdStar className="text-yellow-500 mr-1" />
                            <span className="text-xs font-bold">{stat.avgRating?.toFixed(1)}</span>
                        </div>
                     </div>
                    <h3 className="mt-2 font-bold truncate">{stat.movie.title}</h3>
                </Link>
            ))}
        </div>
      </section>

      {/* Recent Reviews */}
      <section>
        <h2 className="text-3xl font-bold mb-4 border-l-4 border-yellow-500 pl-4">Recent Community Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recentReviews.map((review: any) => (
                <div key={review.id} className="bg-gray-800 p-4 rounded-lg flex gap-4">
                    <img src={review.movie.posterUrl} alt={review.movie.title} className="w-16 h-24 object-cover rounded" />
                    <div>
                        <Link to={`/movie/${review.movie.id}`} className="font-bold hover:text-yellow-500">{review.movie.title}</Link>
                        <div className="flex items-center text-yellow-500 text-sm my-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <MdStar key={i} className={i < Math.round(review.rating / 2) ? "text-yellow-500" : "text-gray-600"} />
                            ))}
                            <span className="ml-2 text-gray-400">by {review.user.username}</span>
                        </div>
                        <p className="text-gray-300 text-sm line-clamp-2">"{review.review}"</p>
                    </div>
                </div>
            ))}
        </div>
      </section>
    </div>
  );
}
