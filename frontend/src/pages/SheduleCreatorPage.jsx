import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Sparkles,
  Plus,
  Trash2,
} from "lucide-react";
import { Navigation } from "../components/Navigation";
import { generateSchedulePDF } from "../lib/pdfGenerator";

export function ScheduleCreatorPage() {
  const navigate = useNavigate();

  // User-entered preferences (just for PDF context)
  const [userPreferences, setUserPreferences] = useState("");

  // User-managed movie list (frontend-only)
  const [movies, setMovies] = useState([
    { title: "Inception", runtime: 148 },
    { title: "Interstellar", runtime: 169 },
  ]);

  // Available time slots
  const [availableTimes, setAvailableTimes] = useState([
    { day: "Monday", startTime: "19:00", endTime: "22:00" },
  ]);

  // Generated schedule
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // --- helpers
  const addTimeSlot = () => {
    setAvailableTimes((prev) => [
      ...prev,
      { day: "Monday", startTime: "19:00", endTime: "22:00" },
    ]);
  };

  const removeTimeSlot = (index) => {
    setAvailableTimes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index, field, value) => {
    setAvailableTimes((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const addMovie = () => {
    setMovies((prev) => [...prev, { title: "", runtime: 120 }]);
  };

  const removeMovie = (index) => {
    setMovies((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMovie = (index, field, value) => {
    setMovies((prev) => {
      const updated = [...prev];
      updated[index][field] = field === "runtime" ? Number(value) : value;
      return updated;
    });
  };

  // Create a simple local schedule by filling slots sequentially
  const handleCreateSchedule = async () => {
    try {
      setLoading(true);
      setError(null);

      const validMovies = movies
        .map((m) => ({ ...m, runtime: Number(m.runtime) || 120 }))
        .filter((m) => m.title.trim());

      if (validMovies.length === 0) {
        throw new Error("Please add at least one movie.");
      }
      if (availableTimes.length === 0) {
        throw new Error("Please add at least one time slot.");
      }

      // Sort time slots by day order then start time (optional polish)
      const dayIndex = (day) => daysOfWeek.indexOf(day);
      const slots = [...availableTimes].sort((a, b) => {
        if (dayIndex(a.day) !== dayIndex(b.day))
          return dayIndex(a.day) - dayIndex(b.day);
        return a.startTime.localeCompare(b.startTime);
      });

      const scheduleItems = [];
      let movieCursor = 0;
      let totalWatchMinutes = 0;
      let totalSlotMinutesUsed = 0;

      for (const slot of slots) {
        const start = new Date(`2000-01-01T${slot.startTime}:00`);
        const end = new Date(`2000-01-01T${slot.endTime}:00`);
        let available = Math.max(0, (end - start) / (1000 * 60) - 15); // 15m buffer

        const slotLabel = `${slot.startTime} - ${slot.endTime}`;
        const slotDurationLabel = minutesToLabel(available);

        // fill with movies while they fit
        while (
          movieCursor < validMovies.length &&
          validMovies[movieCursor].runtime <= available
        ) {
          const m = validMovies[movieCursor];
          scheduleItems.push({
            day: slot.day,
            timeSlot: slotLabel,
            movie: m.title,
            duration: `${m.runtime} min`,
            slotDuration: slotDurationLabel,
            reason: "Fits your slot duration and keeps the pace balanced.",
          });
          available -= m.runtime;
          totalWatchMinutes += m.runtime;
          movieCursor += 1;
        }

        totalSlotMinutesUsed += Math.max(0, (end - start) / (1000 * 60));
        if (movieCursor >= validMovies.length) break;
      }

      if (scheduleItems.length === 0) {
        throw new Error(
          "No movies fit into the provided time slots. Try adding longer slots or shorter movies."
        );
      }

      const scheduleData = {
        schedule: scheduleItems,
        summary: {
          totalMovies: scheduleItems.length,
          totalWatchTime: minutesToLabel(totalWatchMinutes),
          totalScheduledTime: minutesToLabel(totalSlotMinutesUsed),
          efficiency: `${Math.round(
            (totalWatchMinutes / (totalSlotMinutesUsed || 1)) * 100
          )}%`,
          recommendations: [
            "Add another time slot if you want more movies.",
            "Tighten slot gaps (reduce buffer) to fit one more short film.",
          ],
        },
      };

      setSchedule(scheduleData);
    } catch (err) {
      setError(err.message || "Failed to create schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (schedule) {
      generateSchedulePDF(schedule, userPreferences || "");
    }
  };

  function minutesToLabel(mins) {
    const m = Math.max(0, Math.round(mins));
    const h = Math.floor(m / 60);
    const r = m % 60;
    if (h > 0 && r > 0) return `${h}h ${r}m`;
    if (h > 0) return `${h}h`;
    return `${r}m`;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full mr-4 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center">
              <Calendar className="h-8 w-8 mr-3 text-red-600" />
              Schedule Creator
            </h1>
            <p className="text-gray-300 mt-2">
              Plan your perfect movie marathon
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Movies (frontend only) */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">🎬 Movies</h2>

            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <label className="block text-sm text-gray-300 mb-2">
                Your preferences (optional)
              </label>
              <textarea
                className="w-full bg-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={2}
                placeholder="e.g., Sci-Fi, heist thrillers, Tom Holland"
                value={userPreferences}
                onChange={(e) => setUserPreferences(e.target.value)}
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {movies.map((m, i) => (
                <div key={i} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      className="flex-1 bg-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Movie title"
                      value={m.title}
                      onChange={(e) => updateMovie(i, "title", e.target.value)}
                    />
                    <input
                      type="number"
                      min={1}
                      className="w-28 bg-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Runtime"
                      value={m.runtime}
                      onChange={(e) =>
                        updateMovie(i, "runtime", e.target.value)
                      }
                    />
                    <span className="text-gray-300 text-sm">min</span>
                    <button
                      onClick={() => removeMovie(i)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Remove movie"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addMovie}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-full text-sm flex items-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Movie
            </button>
          </div>

          {/* Right Column - Time Slots */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Clock className="h-6 w-6 mr-2 text-red-500" />
                Available Time Slots
              </h2>
              <button
                onClick={addTimeSlot}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-sm flex items-center transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Slot
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {availableTimes.map((slot, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">
                      Time Slot {index + 1}
                    </span>
                    {availableTimes.length > 1 && (
                      <button
                        onClick={() => removeTimeSlot(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Remove slot"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      value={slot.day}
                      onChange={(e) =>
                        updateTimeSlot(index, "day", e.target.value)
                      }
                      className="bg-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {daysOfWeek.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>

                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) =>
                        updateTimeSlot(index, "startTime", e.target.value)
                      }
                      className="bg-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />

                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) =>
                        updateTimeSlot(index, "endTime", e.target.value)
                      }
                      className="bg-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Show slot duration */}
                  <div className="mt-2 text-gray-400 text-sm">
                    Duration:{" "}
                    {(() => {
                      const start = new Date(`2000-01-01T${slot.startTime}:00`);
                      const end = new Date(`2000-01-01T${slot.endTime}:00`);
                      const minutes = Math.max(0, (end - start) / (1000 * 60));
                      const hours = Math.floor(minutes / 60);
                      const mins = Math.round(minutes % 60);
                      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                    })()}{" "}
                    (Available for movie:{" "}
                    {(() => {
                      const start = new Date(`2000-01-01T${slot.startTime}:00`);
                      const end = new Date(`2000-01-01T${slot.endTime}:00`);
                      const minutes = Math.max(
                        0,
                        (end - start) / (1000 * 60) - 15
                      );
                      const hours = Math.floor(minutes / 60);
                      const mins = Math.round(minutes % 60);
                      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                    })()}
                    )
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleCreateSchedule}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Schedule...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Create Schedule (Local)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-8 bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-6 py-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Schedule Creation Failed
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generated Schedule */}
        {schedule && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                📅 Your Local Schedule
              </h2>
              <button
                onClick={handleDownloadPDF}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <Download className="h-5 w-5 mr-2" />
                Download PDF
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {schedule.schedule.map((item, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-red-400 font-bold text-lg">
                      {item.day}
                    </h3>
                    <span className="text-gray-300 font-medium">
                      {item.timeSlot}
                    </span>
                  </div>
                  <h4 className="text-white font-semibold text-xl mb-2">
                    🎥 {item.movie}
                  </h4>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-400">⏱️ Runtime: {item.duration}</p>
                    {item.slotDuration && (
                      <p className="text-gray-500 text-sm">
                        Slot: {item.slotDuration}
                      </p>
                    )}
                  </div>
                  {item.reason && (
                    <p className="text-gray-300 text-sm bg-gray-600 rounded p-2">
                      💡 {item.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {schedule.summary && (
              <div className="mt-6 bg-gray-700 rounded-lg p-4">
                <h3 className="text-white font-bold text-lg mb-3">
                  📊 Schedule Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="text-gray-300">
                    <span className="font-semibold">Total Movies:</span>{" "}
                    {schedule.summary.totalMovies}
                  </div>
                  <div className="text-gray-300">
                    <span className="font-semibold">Total Watch Time:</span>{" "}
                    {schedule.summary.totalWatchTime}
                  </div>
                  {schedule.summary.totalScheduledTime && (
                    <div className="text-gray-300">
                      <span className="font-semibold">
                        Total Scheduled Time:
                      </span>{" "}
                      {schedule.summary.totalScheduledTime}
                    </div>
                  )}
                  {schedule.summary.efficiency && (
                    <div className="text-gray-300">
                      <span className="font-semibold">Time Efficiency:</span>{" "}
                      {schedule.summary.efficiency}
                    </div>
                  )}
                </div>
                {schedule.summary.recommendations?.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">💡 Tips:</h4>
                    <ul className="space-y-1">
                      {schedule.summary.recommendations.map((rec, index) => (
                        <li key={index} className="text-gray-300 text-sm">
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
