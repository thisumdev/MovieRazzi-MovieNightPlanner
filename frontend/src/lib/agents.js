// Handles communication with MovieRazzi AI agents (secure & sanitized)

import { sanitizeInput } from "./sanitize";

// Automatically detect backend protocol and host
const DEFAULT_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE;

// Calls Preference Analyzer Agent

export async function analyzePreferences(userInput) {
  const safeText = sanitizeInput(userInput);
  const res = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_input: safeText }),
  });
  return res.json();
}

//Call IR agent
export async function retrieveMovies(preferenceData) {
  const res = await fetch(`${API_BASE_URL}/retrieve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preferences: preferenceData }),
  });
  return res.json();
}

//Call orchestrator agent
export async function orchestrateAgents(userInput) {
  const safeText = sanitizeInput(userInput);
  const res = await fetch(`${API_BASE_URL}/orchestrate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_input: safeText }),
  });
  return res.json();
}

//Call shedule creator
export async function createSchedule(movies, scheduleText) {
  const safeSchedule = sanitizeInput(scheduleText);
  const res = await fetch(`${API_BASE_URL}/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ movies, schedule_text: safeSchedule }),
  });
  return res.json();
}
