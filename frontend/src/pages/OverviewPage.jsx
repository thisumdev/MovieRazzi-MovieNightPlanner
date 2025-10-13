import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Play, RefreshCw, Sparkles, AlertTriangle } from "lucide-react";
import { Navigation } from "../components/Navigation";
import { MovieCard } from "../components/MovieCard";
import { MovieModal } from "../components/MovieModal";
import { orchestrateAgents } from "../lib/agents";
import { useNavigate } from "react-router-dom";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

export function OverviewPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [query, setQuery] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRandomMoviesSafe();
  }, []);

  const fetchRandomMoviesSafe = async () => {
    try {
      setLoading(true);
      const page = Math.floor(Math.random() * 500) + 1;
      const res = await axios.get(`${TMDB_BASE}/discover/movie`, {
        params: {
          api_key: API_KEY,
          language: "en-US",
          page,
          sort_by: "popularity.desc",
          include_adult: false,
          vote_count_gte: 100,
        },
      });
      setMovies(res.data.results.slice(0, 18));
      setSelectedMovieId(null);
    } catch (err) {
      console.error("Failed to fetch random movies:", err);
      setError("Failed to load movies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMagic = async () => {
    if (!query.trim()) {
      setError("Please enter your movie preferences first!");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setAnalysis(null);

      const res = await orchestrateAgents(query);
      if (res.error) {
        setError(res.error);
        setMovies([]);
        return;
      }

      setAnalysis(res.analysis || null);
      if (Array.isArray(res.movies) && res.movies.length > 0) {
        setMovies(res.movies);
        localStorage.setItem("retrieved_movies", JSON.stringify(res.movies));
      } else {
        setError("No relevant movies found for your preferences.");
      }
    } catch (err) {
      console.error("Magic Error:", err);
      setError("Failed to analyze or fetch movies.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => setSelectedMovieId(null);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />

      {/* Hero Section */}
      <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop"
            alt="Movies background"
            className="w-full h-full object-cover"
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
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> Loading...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" /> Do the Magic!!!
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      {analysis && (
        <div className="container mx-auto px-4 py-10">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
            <h2 className="text-2xl font-bold text-red-500 mb-4">
              🎯 Your Movie Preferences
            </h2>
            <p className="text-gray-300 mb-2">
              <strong>Genres:</strong>{" "}
              {analysis.detected_genres?.join(", ") || "Not specified"}
            </p>
            <p className="text-gray-300 mb-2">
              <strong>People Mentioned:</strong>{" "}
              {analysis.entities?.people?.join(", ") || "None"}
            </p>
            <p className="text-gray-400 italic">{analysis.summary}</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="container mx-auto px-4 mb-8">
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-lg text-center">
            <AlertTriangle className="h-6 w-6 inline-block mr-2 text-red-500" />
            <span className="text-lg font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Movie Grid */}
      <div className="container mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold text-white mb-8">Movies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={() => setSelectedMovieId(movie.id)}
            />
          ))}
        </div>

        {/* Plan Schedule Button */}
        {movies.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/schedule")}
              className="bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-full font-semibold transition-all"
            >
              Plan Schedule →
            </button>
          </div>
        )}
      </div>

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
