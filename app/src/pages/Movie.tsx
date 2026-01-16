import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MdStar, MdCalendarToday, MdMovie, MdAdd } from "react-icons/md";
import { AuthContext } from "@/lib/firebase";
import { handleGetMovieById, handleAddWatch, handleAddReview } from "@/lib/MovieService";
import { User } from "firebase/auth";

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const auth = useContext(AuthContext);
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Watch Modal State
  const [showWatchModal, setShowWatchModal] = useState(false);
  const [watchFormat, setWatchFormat] = useState("home");

  useEffect(() => {
    if (id) {
      handleGetMovieById(id).then((data) => {
        setMovie(data);
        setLoading(false);
      });
    }
  }, [id]);

  const onLogWatch = async () => {
    if(!id) return;
    try {
        await handleAddWatch(id, watchFormat, new Date().toISOString().split('T')[0]);
        alert("Logged to history!");
        setShowWatchModal(false);
    } catch(e) {
        alert("Error logging watch");
    }
  }

  if (loading) return <div className="text-white p-10">Loading...</div>;
  if (!movie) return <div className="text-white p-10">Movie not found</div>;

  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen text-white">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
           
          <img className="w-full rounded-lg shadow-2xl" src={movie.posterUrl} alt={movie.title} />
          
          {auth.currentUser && (
              <button 
                onClick={() => setShowWatchModal(true)}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition"
              >
                <MdAdd size={24} /> Log as Watched
              </button>
          )}
        </div>

        <div className="w-full md:w-2/3">
          <h1 className="text-5xl font-bold mb-2">{movie.title}</h1>
          <div className="flex items-center gap-4 text-gray-400 mb-6">
            <span className="border border-gray-600 px-2 py-0.5 rounded text-sm">{movie.rating}</span>
            <span className="flex items-center gap-1"><MdCalendarToday /> {new Date(movie.releaseDate).getFullYear()}</span>
            <span className="flex items-center gap-1"><MdMovie /> {movie.genre}</span>
             {movie.stats?.avgRating && (
                <span className="flex items-center gap-1 text-yellow-500 font-bold">
                    <MdStar /> {(movie.stats.avgRating / 2).toFixed(1)}/5
                </span>
             )}
          </div>

          <p className="text-lg leading-relaxed text-gray-300 mb-8">{movie.description}</p>
          
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">Top Cast</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {movie.roles.map((role: any) => (
                <div key={role.actor.id} className="text-center bg-gray-800 p-3 rounded-lg">
                    <img src={role.actor.imageUrl} alt={role.actor.name} className="w-20 h-20 rounded-full mx-auto object-cover mb-2" />
                    <div className="font-bold text-sm">{role.actor.name}</div>
                    <div className="text-xs text-gray-400">{role.character}</div>
                </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">Reviews</h2>
          <div className="space-y-4">
            {movie.reviews.length === 0 && <p className="text-gray-500">No reviews yet.</p>}
            {movie.reviews.map((review: any) => (
                <div key={review.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                        <span className="font-bold text-blue-400">{review.user.username}</span>
                        <div className="flex text-yellow-500">
                             {Array.from({ length: 5 }).map((_, i) => (
                                <MdStar key={i} className={i < Math.round(review.rating / 2) ? "opacity-100" : "opacity-30"} />
                            ))}
                        </div>
                    </div>
                    <p className="mt-2 text-gray-300">{review.review}</p>
                </div>
            ))}
          </div>
        </div>
      </div>

      {/* Watch Modal */}
      {showWatchModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Log Watch History</h3>
                <label className="block mb-2">Format</label>
                <select 
                    value={watchFormat} 
                    onChange={(e) => setWatchFormat(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white mb-6"
                >
                    <option value="home">Home (Streaming/TV)</option>
                    <option value="theater">Theater</option>
                    <option value="theater-premium">IMAX / Premium</option>
                    <option value="mobile">Mobile</option>
                </select>
                <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowWatchModal(false)} className="px-4 py-2 hover:bg-gray-700 rounded">Cancel</button>
                    <button onClick={onLogWatch} className="px-4 py-2 bg-blue-600 rounded">Save</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
