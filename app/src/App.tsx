import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import HomePage from './pages/Home';
import MoviePage from './pages/Movie';
import BrowsePage from './pages/Browse';
import AdvancedSearchPage from './pages/AdvancedSearch';
import WatchHistoryPage from './pages/WatchHistory';
import NotFound from './pages/NotFound';
import { AuthProvider } from './lib/firebase'; // Assuming you have this from old app

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:id" element={<MoviePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/search-fts" element={<AdvancedSearchPage />} />
          <Route path="/history" element={<WatchHistoryPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;