import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Star, Users } from "lucide-react";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export function MovieModal({ movieId, isOpen, onClose }) {
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && movieId) fetchMovieData(movieId);
  }, [isOpen, movieId]);

  async function tmdb(path, params = {}) {
    if (!TMDB_API_KEY) throw new Error("Missing VITE_TMDB_API_KEY");
    const url = new URL(`${TMDB_BASE}${path}`);
    url.searchParams.set("api_key", TMDB_API_KEY);
    url.searchParams.set("include_adult", "false"); // server-side filter
    url.searchParams.set("language", "en-US");
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    url.searchParams.set("_", Date.now().toString());
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error("TMDB request failed");
    return res.json();
  }

  const fetchMovieData = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const [details, credits] = await Promise.all([
        tmdb(`/movie/${id}`),
        tmdb(`/movie/${id}/credits`),
      ]);

      // Client-side safety net: do not show adult movies in modal either
      if (details?.adult) {
        setError("This title is not available.");
        setMovie(null);
        setCast([]);
        return;
      }

      setMovie(details);
      setCast(credits?.cast || []);
    } catch (error) {
      setError("Failed to load movie details");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const backdropUrl = movie?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&fit=crop";

  const posterUrl = movie?.poster_path
    ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
    : "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=500&h=750&fit=crop";

  return (
    <div className="fixed inset-0 z-50">
      {/* Dimmer */}
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />

      {/* Panel */}
      <div className="relative mx-auto my-8 w-[95%] max-w-4xl">
        <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          {loading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-[60vh] px-6 text-center">
              <p className="text-red-500 text-xl">{error}</p>
            </div>
          ) : movie ? (
            <>
              {/* Backdrop */}
              <div className="relative h-80">
                <img
                  src={backdropUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
              </div>

              {/* Scrollable content */}
              <div className="px-6 py-6 max-h-[65vh] overflow-y-auto">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      className="w-48 h-72 object-cover rounded-lg mx-auto lg:mx-0"
                    />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">
                        {movie.title}
                      </h2>
                      {movie.tagline && (
                        <p className="text-gray-400 text-lg italic">
                          "{movie.tagline}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-red-500" />
                        <span>
                          {movie.release_date
                            ? new Date(movie.release_date).getFullYear()
                            : "—"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-red-500" />
                        <span>
                          {movie.runtime ? `${movie.runtime} min` : "—"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                        <span>
                          {Number(movie.vote_average || 0).toFixed(1)}/10
                        </span>
                      </div>
                    </div>

                    {movie.genres?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {movie.genres.map((genre) => (
                          <span
                            key={genre.id}
                            className="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-sm"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {movie.overview && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          Overview
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          {movie.overview}
                        </p>
                      </div>
                    )}

                    {cast.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <Users className="h-5 w-5 mr-2 text-red-500" />
                          Cast
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {cast.slice(0, 8).map((actor) => (
                            <div key={actor.id} className="text-center">
                              <img
                                src={
                                  actor.profile_path
                                    ? `${TMDB_IMAGE_BASE_URL}${actor.profile_path}`
                                    : "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&fit=crop"
                                }
                                alt={actor.name}
                                className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
                              />
                              <p className="text-white text-sm font-medium truncate">
                                {actor.name}
                              </p>
                              <p className="text-gray-400 text-xs truncate">
                                {actor.character}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
