import React from "react";
import { Calendar, Star } from "lucide-react";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export function MovieCard({ movie, onClick }) {
  const posterUrl = movie.poster_path
    ? movie.poster_path.startsWith("http")
      ? movie.poster_path
      : `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
    : "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=500&h=750&fit=crop";

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "N/A";

  return (
    <div
      onClick={onClick}
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer group transition-all"
    >
      <div className="relative overflow-hidden">
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-full flex items-center">
          <Star className="h-3 w-3 text-yellow-400 fill-current" />
          <span className="text-white text-xs font-semibold ml-1">
            {Number(movie.vote_average || 0).toFixed(1)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
          {movie.title}
        </h3>
        {movie.reason && (
          <p className="text-gray-400 text-xs italic mb-2">{movie.reason}</p>
        )}
        <div className="flex items-center text-gray-400 text-sm">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{releaseYear}</span>
        </div>
      </div>
    </div>
  );
}
