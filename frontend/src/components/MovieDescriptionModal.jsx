import { Dialog } from "@headlessui/react";

const MovieDescriptionModal = ({ movie, onClose }) => {
  if (!movie) return null;

  return (
    <Dialog open={!!movie} onClose={onClose} className="relative z-50">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white w-full max-w-2xl rounded-lg p-6 shadow-xl">
          <Dialog.Title className="text-2xl font-bold mb-3">
            {movie.title}
          </Dialog.Title>

          <img
            src={`https://image.tmdb.org/t/p/w780${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-64 object-cover rounded mb-4"
          />

          <p className="text-gray-800 mb-3">
            {movie.overview || "No description available."}
          </p>

          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <span>
              <strong>📅 Release Date:</strong>{" "}
              {movie.release_date || "Unknown"}
            </span>
            <span>
              <strong>⭐ Rating:</strong>{" "}
              {movie.vote_average ? `${movie.vote_average}/10` : "N/A"}
            </span>
          </div>

          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default MovieDescriptionModal;
