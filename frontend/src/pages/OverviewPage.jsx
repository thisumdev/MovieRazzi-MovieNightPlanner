import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Play, RefreshCw, Sparkles } from "lucide-react";
import { Navigation } from "../components/Navigation";
import { MovieCard } from "../components/MovieCard";
import { MovieModal } from "../components/MovieModal";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

export function OverviewPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchRandomMoviesSafe();
  }, []);

  const fetchRandomMoviesSafe = async () => {
    try {
      if (!API_KEY) throw new Error("Missing VITE_TMDB_API_KEY");
      setLoading(true);
      setError(null);

      // Try up to 3 random pages to ensure we get a decent safe batch
      let attempts = 0;
      let safeBatch = [];

      while (attempts < 3 && safeBatch.length === 0) {
        attempts += 1;
        const page = Math.floor(Math.random() * 500) + 1;

        const res = await axios.get(`${TMDB_BASE}/discover/movie`, {
          params: {
            api_key: API_KEY,
            language: "en-US",
            page,
            sort_by: "popularity.desc",
            include_adult: false, // server-side adult filter
            include_video: false,
            certification_country: "US", // restrict to US ratings
            certification_lte: "PG-13", // keep G/PG/PG-13 only
            vote_count_gte: 50, // avoid obscure edge cases
            // Optional: bias to US availability; comment out if too strict:
            // watch_region: "US",
          },
        });

        const results = Array.isArray(res.data?.results)
          ? res.data.results
          : [];

        // Client-side safety net: re-check the adult flag and require a poster
        safeBatch = results
          .filter((m) => m && m.poster_path && m.adult !== true)
          .slice(0, 18);
      }

      if (safeBatch.length === 0) {
        throw new Error(
          "Couldn't find safe titles right now. Please try again."
        );
      }

      setMovies(safeBatch);
      setSelectedMovieId(null);
    } catch (err) {
      console.error("Failed to fetch safe movies:", err);
      setError("Failed to load safe movies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => setSelectedMovieId(null);
  const handleMagic = () => fetchRandomMoviesSafe();

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />

      {/* Hero */}
      <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop"
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.pexels.com/photos/7991319/pexels-photo-7991319.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop";
            }}
          />
        </div>
        <div className="absolute inset-0 bg-black/60 z-10" />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Play className="h-16 w-16 text-red-600 mr-4" />
            <h1 className="text-6xl md:text-8xl font-bold text-white">
              Movie<span className="text-red-600">Razzi</span>
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Unlimited movies, TV shows and more.
          </p>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-6 w-6" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What would you like to watch?"
              className="w-full bg-black/50 backdrop-blur-sm text-white pl-12 pr-6 py-4 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-red-600 border border-gray-600 placeholder-gray-400"
            />
          </div>

          <div className="mt-6">
            <button
              onClick={handleMagic}
              disabled={loading}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Do the magic!!!
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">
            Random Movies (Safe)
          </h2>
          <button
            onClick={fetchRandomMoviesSafe}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition-colors"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-lg mb-8 text-center">
            <p className="text-lg">{error}</p>
            <button
              onClick={fetchRandomMoviesSafe}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg overflow-hidden animate-pulse"
              >
                <div className="h-80 bg-gray-700" />
                <div className="p-4">
                  <div className="h-4 bg-gray-700 rounded mb-2" />
                  <div className="h-3 bg-gray-700 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={() => setSelectedMovieId(movie.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedMovieId && (
        <MovieModal
          key={selectedMovieId}
          movieId={selectedMovieId}
          isOpen={!!selectedMovieId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
