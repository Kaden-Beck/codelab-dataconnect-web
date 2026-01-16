import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/lib/firebase';
import { handleGetWatchHistory, handleDeleteWatch } from '@/lib/MovieService';
import { Link, useNavigate } from 'react-router-dom';
import { MdDelete, MdTv, MdSmartphone, MdMovie } from 'react-icons/md';

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
    // Basic route protection
    if(!auth.currentUser) {
        navigate("/");
    } else if (auth.currentUser) {
        fetchHistory();
    }
  }, [auth.currentUser, navigate]);

  const onDelete = async (id: string) => {
    if(window.confirm("Remove from history?")) {
        await handleDeleteWatch(id);
        fetchHistory(); // Refresh
    }
  };

  // Group by Month Helper
  const grouped = watches.reduce((acc: any, watch) => {
    const month = watch.watchDate.substring(0, 7); // YYYY-MM
    if(!acc[month]) acc[month] = [];
    acc[month].push(watch);
    return acc;
  }, {});

  if (loading) return <div className="p-10 text-white">Loading history...</div>;

  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8">My Watch History</h1>

      {Object.keys(grouped).sort().reverse().map(month => (
        <div key={month} className="mb-8">
            <h2 className="text-xl font-bold text-gray-400 mb-4 border-b border-gray-700 pb-2">
                {new Date(month + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-700 text-gray-300 text-sm">
                        <tr>
                            <th className="p-4">Day</th>
                            <th className="p-4">Movie</th>
                            <th className="p-4 hidden md:table-cell">Format</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {grouped[month].map((watch: any) => (
                            <tr key={watch.id} className="border-b border-gray-700 hover:bg-gray-750 transition">
                                <td className="p-4 text-xl font-mono text-gray-400">
                                    {watch.watchDate.substring(8, 10)}
                                </td>
                                <td className="p-4">
                                    <Link to={`/movie/${watch.movie.id}`} className="flex items-center gap-4 group">
                                        <img src={watch.movie.posterUrl} className="w-10 h-14 object-cover rounded" alt="" />
                                        <div>
                                            <div className="font-bold group-hover:text-blue-400">{watch.movie.title}</div>
                                            <div className="text-xs text-gray-500">{new Date(watch.movie.releaseDate).getFullYear()}</div>
                                        </div>
                                    </Link>
                                </td>
                                <td className="p-4 hidden md:table-cell text-sm text-gray-400 capitalize">
                                    <div className="flex items-center gap-2">
                                        {watch.format === 'home' && <MdTv />}
                                        {watch.format === 'mobile' && <MdSmartphone />}
                                        {watch.format.includes('theater') && <MdMovie />}
                                        {watch.format.replace('-', ' ')}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => onDelete(watch.id)} className="text-gray-500 hover:text-red-500 p-2">
                                        <MdDelete size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      ))}
      {watches.length === 0 && <p className="text-gray-500 text-center mt-10">You haven't watched any movies yet.</p>}
    </div>
  );
}
