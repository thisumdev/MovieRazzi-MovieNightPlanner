import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Film, Loader2, Star, User, Clock, Globe, Smile } from "lucide-react";

export default function PreferenceAnalyzer() {
  const [userInput, setUserInput] = useState("");
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInput.trim()) {
      alert("Please enter your movie preferences!");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("http://127.0.0.1:8000/preferences/analyze", {
        user_input: userInput,
      });
      setPreferences(response.data.preferences);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl p-8 border border-gray-200"
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Film className="w-10 h-10 text-indigo-600" />
          <h1 className="text-3xl font-poppins font-bold text-gray-800">
            Movie Night Planner 🎬
          </h1>
        </div>

        {/* Subheading */}
        <p className="text-center text-gray-500 mb-6 text-lg">
          Tell us your movie preferences, and our AI will analyze them beautifully.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="E.g. I want a romantic comedy starring Emma Stone under 2 hours"
            className="w-full h-32 p-4 rounded-xl bg-gray-50 border border-gray-300 placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 text-white py-3 rounded-xl text-lg font-semibold ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading && <Loader2 className="animate-spin w-5 h-5" />}
            {loading ? "Analyzing..." : "Analyze Preferences"}
          </button>
        </form>

        {/* Animated Result Cards */}
        {preferences && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-8"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🎥 Your Preferences:
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white shadow-md rounded-xl p-5 border border-gray-200 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <p className="text-gray-600 text-sm">Genre</p>
                </div>
                <p className="font-semibold text-gray-800 mt-2">
                  {preferences.genre?.join(", ") || "Any"}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white shadow-md rounded-xl p-5 border border-gray-200 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-pink-500" />
                  <p className="text-gray-600 text-sm">Actors</p>
                </div>
                <p className="font-semibold text-gray-800 mt-2">
                  {preferences.preferred_actors?.join(", ") || "Any"}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white shadow-md rounded-xl p-5 border border-gray-200 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-green-500" />
                  <p className="text-gray-600 text-sm">Language</p>
                </div>
                <p className="font-semibold text-gray-800 mt-2">
                  {preferences.language || "Any"}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white shadow-md rounded-xl p-5 border border-gray-200 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-blue-500" />
                  <p className="text-gray-600 text-sm">Duration</p>
                </div>
                <p className="font-semibold text-gray-800 mt-2">
                  {preferences.duration_limit ? `${preferences.duration_limit} mins` : "Any"}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="bg-white shadow-md rounded-xl p-5 border border-gray-200 hover:shadow-lg transition sm:col-span-2"
              >
                <div className="flex items-center gap-3">
                  <Smile className="w-6 h-6 text-purple-500" />
                  <p className="text-gray-600 text-sm">Mood</p>
                </div>
                <p className="font-semibold text-gray-800 mt-2">
                  {preferences.mood || "Any"}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
