import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/firebase";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

import Header from "@/components/header";
import HomePage from "@/pages/Home";
import MoviePage from "@/pages/Movie";
import BrowsePage from "@/pages/Browse";
import WatchHistoryPage from "@/pages/WatchHistory";
import AdvancedSearchPage from "./pages/AdvancedSearch";
import VectorSearchPage from "./pages/VectorSearch";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <div className="min-h-screen bg-background text-foreground font-sans antialiased">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/movie/:id" element={<MoviePage />} />
                <Route path="/browse" element={<BrowsePage />} />
                <Route path="/history" element={<WatchHistoryPage />} />
                <Route
                  path="/advancedsearch"
                  element={<AdvancedSearchPage />}
                />
                {/* <Route path="/vectorsearch" element={<VectorSearchPage />} /> */}
              </Routes>
            </main>
            <Toaster />
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
