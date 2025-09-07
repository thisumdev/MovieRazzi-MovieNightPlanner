// src/components/MovieCard.jsx
import { motion } from "framer-motion";

const MovieCard = ({ movie, onClick }) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:scale-105 transition"
      whileHover={{ scale: 1.03 }}
      onClick={() => onClick(movie)}
    >
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        className="w-full h-64 object-cover"
      />
      <div className="p-2">
        <h3 className="text-sm font-semibold">{movie.title}</h3>
      </div>
    </motion.div>
  );
};

export default MovieCard;
