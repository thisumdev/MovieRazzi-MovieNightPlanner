import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Search, Menu, LogOut, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

import movieCover from "../assets/cover-img.png";
import MovieDescriptionModal from "../components/MovieDescriptionModal";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const OverviewPage = () => {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  // Fetch random movies on mount
  useEffect(() => {
    fetchRandomMovies();
  }, []);

  const fetchRandomMovies = async () => {
    try {
      const page = Math.floor(Math.random() * 500) + 1;
      const res = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&page=${page}&include_adult=false`
      );
      const randomMovies = res.data.results
        .filter((m) => m.poster_path)
        .slice(0, 18); // only 15 movies
      setMovies(randomMovies);
      setSelectedMovie(null);
    } catch (error) {
      console.error("Failed to fetch movies:", error);
    }
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="bg-gray-100 min-h-screen relative">
      {/* 🔽 Dropdown Menu */}
      <div className="absolute top-6 right-6 z-50">
        <div className="relative group">
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-200 transition">
            <Menu className="w-5 h-5" />
            <span className="text-sm font-medium">Menu</span>
          </button>

          <div className="hidden group-hover:flex flex-col absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border z-50">
            <button
              className="px-4 py-2 text-left hover:bg-gray-100 text-sm flex items-center gap-2"
              onClick={() => console.log("Movie Schedules clicked")}
            >
              <Calendar className="w-4 h-4" />
              Movie Schedules
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-left hover:bg-gray-100 text-sm flex items-center gap-2 text-red-500"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* 🎬 Cover Image with Search */}
      <div
        className="relative w-full h-[75vh] bg-cover bg-center flex flex-col items-center justify-center"
        style={{ backgroundImage: `url(${movieCover})` }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-xl text-center px-4">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-white" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Enter your preferences… Let the Movie Magic begin!"
              className="w-full pl-11 pr-4 py-3 rounded-xl text-base
                bg-white/10 text-white placeholder-white/70
                border border-white/30 focus:outline-none
                focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]
                shadow-sm transition duration-200 backdrop-blur-sm"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="mt-2 px-6 py-3 rounded-xl bg-[#2563eb] text-white font-semibold shadow-md hover:bg-blue-700 transition"
            onClick={() => console.log("User preferences:", search)}
          >
            Do the magic!!
          </motion.button>
        </div>
      </div>

      {/* 🟦 Movie Grid */}
      <div className="w-full py-10 px-6">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          🎬 Explore Movies
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
          {movies.map((movie) => (
            <motion.div
              key={movie.id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:scale-105 transition w-full max-w-[200px]"
              onClick={() => handleMovieClick(movie)}
              whileHover={{ scale: 1.03 }}
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-2">
                <h3 className="text-sm font-semibold text-center">
                  {movie.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 🔳 Movie Modal */}
      <MovieDescriptionModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
};

export default OverviewPage;
