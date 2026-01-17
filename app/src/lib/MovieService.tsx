/**
 * src/lib/MovieService.ts
 * Wraps the generated Data Connect SDK for the Vite App
 */
import {
  homePage,
  moviePage,
  browseMovies,
  watchHistoryPage,
  searchMoviesFts,
  addWatch,
  deleteWatch,
  addVerifiedReview,
  searchMovies,
  updateUser,
  searchMoviesVector, 
  searchAll
} from "@movie/dataconnect"; // Assuming your generated SDK path
import { onAuthStateChanged, User } from "firebase/auth";

// --- Queries ---

export const handleGetHomePageData = async () => {
  try {
    const response = await homePage();
    return response.data;
  } catch (error) {
    console.error("Error fetching home page data:", error);
    return null;
  }
};

export const handleGetMovieById = async (movieId: string) => {
  try {
    const response = await moviePage({ movieId });
    return response.data.movie;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
};

export const handleBrowseMovies = async (filters: any) => {
  try {
    // Map UI filters to GQL variables
    const variables: any = {};
    if (filters.title) variables.partialTitle = filters.title;
    if (filters.minYear) variables.minDate = `${filters.minYear}-01-01`;
    if (filters.maxYear) variables.maxDate = `${filters.maxYear}-12-31`;
    if (filters.minRating) variables.minRating = filters.minRating; // 0-10 scale
    if (filters.genres && filters.genres.length > 0)
      variables.genres = filters.genres;

    const response = await browseMovies(variables);
    return response.data;
  } catch (error) {
    console.error("Error browsing movies:", error);
    return null;
  }
};

export const handleGetWatchHistory = async (limit?: number) => {
  try {
    const response = await watchHistoryPage({ limit });
    return response.data.watches;
  } catch (error) {
    console.error("Error fetching watch history:", error);
    return [];
  }
};

export const handleSearchMoviesFTS = async (query: string) => {
  try {
    const response = await searchMoviesFts({ query });
    return response.data;
  } catch (error) {
    console.error("Error performing FTS search:", error);
    return null;
  }
};

// --- Mutations ---

export const handleAddWatch = async (
  movieId: string,
  format: string,
  watchDate: string
) => {
  try {
    await addWatch({ movieId, format, watchDate });
  } catch (error) {
    console.error("Error logging watch:", error);
    throw error;
  }
};

export const handleDeleteWatch = async (movieId: string) => {
  try {
    await deleteWatch({ movieId });
  } catch (error) {
    console.error("Error deleting watch:", error);
    throw error;
  }
};

export const handleAddReview = async (
  movieId: string,
  rating: number,
  review: string
) => {
  try {
    await addVerifiedReview({ movieId, rating, review });
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
};

export const handleAuthStateChange = (
  auth: any,
  setUser: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      setUser(firebaseUser);

      try {
        await updateUser({
          username: firebaseUser.email?.split("@")[0] || "anon",
          displayName: firebaseUser.displayName || "Anonymous",
          imageUrl: firebaseUser.photoURL || "",
        });
        console.log("User synced to database successfully");
      } catch (e) {
        console.error("Error syncing user to Data Connect:", e);
      }
    } else {
      setUser(null);
    }
  });
};

export const handleVectorSearch = async (query: string) => {
  try {
    const response = await searchMoviesVector({ query });
    return response.data.movies_embedding_similarity;
  } catch (error) {
    console.error("Vector Search Error:", error);
    return [];
  }
};

// 2. Full Text Search
export const handleFTS = async (query: string) => {
  try {
    const response = await searchMoviesFts({ query });
    return response.data;
  } catch (error) {
    console.error("FTS Error:", error);
    return { query: [], phrase: [], plain: [] };
  }
};

// 3. Advanced Filter Search
export const handleAdvancedSearch = async (
  textInput: string,
  minYear: number,
  maxYear: number,
  minRating: number, // 0-10
  genre: string
) => {
  try {
    const response = await searchAll({
      titleInput: textInput,
      minDate: `${minYear}-01-01`,
      maxDate: `${maxYear}-12-31`,
      minAvgRating: minRating,
      genre: genre === "All" ? "" : genre
    });
    return response.data;
  } catch (error) {
    console.error("Advanced Search Error:", error);
    return null;
  }
};
