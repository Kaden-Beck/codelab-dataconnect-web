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
  addReview,
  searchMovies,
  updateUser
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
    const variables: any = {
    };
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

export const handleVectorSearch = async (query: string) => {
  try {
    const response = await searchMovies({ query });
    return response.data.movies;
  } catch (error) {
    console.error("Error performing vector search", error);
    return [];
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

export const handleDeleteWatch = async (watchId: string) => {
  try {
    await deleteWatch({ watchId });
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
    await addReview({ movieId, rating, review });
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

      // Sync the Firebase Auth user to your Data Connect "User" table
      // using the "UpdateUser" mutation defined in your new schema
      try {
        await updateUser({
          username: firebaseUser.email?.split("@")[0] || "anon",
          displayName: firebaseUser.displayName || "Anonymous",
          imageUrl: firebaseUser.photoURL || "",
        });
      } catch (e) {
        console.error("Error syncing user to Data Connect:", e);
      }
    } else {
      setUser(null);
    }
  });
};
