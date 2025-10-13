import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Download,
  Sparkles,
  ExternalLink,
  Film,
} from "lucide-react";
import { Navigation } from "../components/Navigation";
import { generateSchedulePDF } from "../lib/pdfGenerator";
import { createSchedule } from "../lib/agents";

export function ScheduleCreatorPage() {
  const navigate = useNavigate();
  const [retrievedMovies, setRetrievedMovies] = useState([]);
  const [userAvailability, setUserAvailability] = useState("");
  const [aiSchedule, setAiSchedule] = useState(null);
  const [editableSchedule, setEditableSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //Loading the saved movies which were stored in our local storage after retrieveing
  useEffect(() => {
    const saved = localStorage.getItem("retrieved_movies");
    if (saved) setRetrievedMovies(JSON.parse(saved));
  }, []);

  //Generating the shedule
  const handleAISchedule = async () => {
    if (!userAvailability.trim())
      return setError("Please describe when you are free.");
    if (!retrievedMovies.length)
      return setError(
        "No retrieved movies found — go back and generate first."
      );

    try {
      setLoading(true);
      setError(null);
      const res = await createSchedule(retrievedMovies, userAvailability);
      if (res.error) setError(res.error);
      else {
        setAiSchedule(res);
        setEditableSchedule(res.schedule || []);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to generate schedule.");
    } finally {
      setLoading(false);
    }
  };

  //Implementing slot movie update
  const updateMovieInSlot = (slotIndex, movieIndex, newMovieId) => {
    const newMovie = retrievedMovies.find((m) => m.id === parseInt(newMovieId));
    if (!newMovie) return;

    const runtime = parseInt(newMovie.runtime || 120);

    const currentSlot = editableSchedule[slotIndex];
    const totalOtherMovies = currentSlot.movies.reduce(
      (sum, m, i) => (i === movieIndex ? sum : sum + parseInt(m.runtime || 0)),
      0
    );
    const newTotal = totalOtherMovies + runtime;

    if (newTotal > currentSlot.slot_duration) {
      alert(
        `${newMovie.title} (${runtime} min) would exceed your ${currentSlot.slot_duration} min slot on ${currentSlot.day}.`
      );
      return;
    }

    // update
    const updatedSchedule = editableSchedule.map((slot, i) => {
      if (i !== slotIndex) return slot;
      const updatedMovies = slot.movies.map((m, j) =>
        j === movieIndex ? { title: newMovie.title, runtime } : m
      );
      return {
        ...slot,
        movies: updatedMovies,
        total_runtime: newTotal,
      };
    });

    setEditableSchedule(updatedSchedule);
  };

  // Validation before export

  const validateSlots = () => {
    for (const slot of editableSchedule) {
      const total = slot.total_runtime || 0;
      if (total > slot.slot_duration) {
        alert(
          `Total runtime (${total} min) exceeds your ${slot.slot_duration} min slot on ${slot.day}.`
        );
        return false;
      }
    }
    return true;
  };

  // Google Calendar Export (1 per day - in progress still only one date opening)

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const handleAddToGoogleCalendar = async () => {
    if (!editableSchedule.length) return;
    if (!validateSlots()) return;

    const base = new Date();
    const todayIdx = base.getDay();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    for (const slot of editableSchedule) {
      await new Promise((resolve) => {
        const startHour = slot.start_hour || 18;
        const total = slot.total_runtime || 0;
        const idx = days.findIndex(
          (d) => d.toLowerCase() === slot.day.toLowerCase()
        );
        const diff = (idx + 7 - todayIdx) % 7 || 7;

        const start = new Date(base);
        start.setDate(base.getDate() + diff);
        start.setHours(startHour, 0, 0, 0);
        const end = new Date(start.getTime() + total * 60000);

        const startISO = start.toISOString().replace(/[-:]|\.\d{3}/g, "");
        const endISO = end.toISOString().replace(/[-:]|\.\d{3}/g, "");

        const details = slot.movies
          .map((m, i) => `${i + 1}. ${m.title} (${m.runtime} min)`)
          .join("%0A");

        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
          "🎬 MovieRazzi Night – " + slot.day
        )}&dates=${startISO}/${endISO}&details=${details}`;
        window.open(url, "_blank");
        setTimeout(resolve, 2000);
      });
    }
  };

  // PDF Export

  const handleDownloadPDF = () => {
    if (!editableSchedule.length) return;
    if (!validateSlots()) return;
    const data = { ...aiSchedule, schedule: editableSchedule };
    generateSchedulePDF(data, userAvailability);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full mr-4"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center">
              <Calendar className="h-8 w-8 mr-3 text-red-600" />
              Schedule Creator
            </h1>
            <p className="text-gray-300 mt-2">
              Plan your movie nights — scheduling, interactive editing, and
              runtime validation.
            </p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-red-500 mb-4 flex items-center">
            <Film className="h-6 w-6 mr-2" /> Movie Night Planner
          </h2>

          <textarea
            rows={3}
            className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-red-500 mb-4"
            placeholder='e.g., "I am free for 3 hours on Monday and 4 hours on Friday after 6pm."'
            value={userAvailability}
            onChange={(e) => setUserAvailability(e.target.value)}
          />

          <button
            onClick={handleAISchedule}
            disabled={loading}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-lg font-semibold transition-all"
          >
            {loading ? (
              <>
                <Sparkles className="h-5 w-5 mr-2 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" /> Generate your perfect
                Schedule
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-center">
              {error}
            </div>
          )}

          {editableSchedule.length > 0 && (
            <div className="mt-8 bg-gray-700 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-white mb-4">
                🎬Generated Schedule
              </h3>

              <div className="space-y-4">
                {editableSchedule.map((slot, i) => (
                  <div
                    key={i}
                    className="bg-gray-800 border border-gray-600 rounded-lg p-4"
                  >
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <h4 className="text-red-400 font-bold text-lg">
                          {slot.day} — Free Time: {slot.slot_duration} min
                        </h4>
                        <p className="text-gray-400 text-sm">{slot.reason}</p>
                      </div>
                      <div className="text-gray-300 text-sm font-medium">
                        Total Runtime:{" "}
                        <span className="text-white">
                          {slot.total_runtime} / {slot.slot_duration} min
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {slot.movies.map((movie, j) => (
                        <div
                          key={j}
                          className="flex justify-between items-center bg-gray-700 rounded px-3 py-2"
                        >
                          <select
                            value={
                              retrievedMovies.find(
                                (m) => m.title === movie.title
                              )?.id || ""
                            }
                            onChange={(e) =>
                              updateMovieInSlot(i, j, e.target.value)
                            }
                            className="bg-gray-600 text-white rounded px-2 py-1 w-3/4"
                          >
                            <option value="">Select</option>
                            {retrievedMovies.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.title} ({m.runtime || 120} min)
                              </option>
                            ))}
                          </select>
                          <span className="text-gray-300 text-sm">
                            {movie.runtime} min
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <button
                  onClick={handleDownloadPDF}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center"
                >
                  <Download className="h-5 w-5 mr-2" /> Download PDF
                </button>
                <button
                  onClick={handleAddToGoogleCalendar}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center"
                >
                  <ExternalLink className="h-5 w-5 mr-2" /> Add to Google
                  Calendar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
