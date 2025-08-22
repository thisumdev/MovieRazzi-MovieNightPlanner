# MovieRazzi-MovieNightPlanner
An AI-powered multi-agent system that helps users plan a perfect movie night based on their preferences, recommends movies using intelligent models, and schedules time automatically with calendar integration.

Movie Night Planner

Movie Night Planner is an AI-powered system that helps users:
- Analyze their movie preferences,
- Recommend personalized movies using NLP and ML,
- Schedule the perfect time using calendar integration.

This project uses a **multi-agent architecture**, combining LLMs, scikit-learn models, and external APIs to provide a smart, secure, and user-friendly movie night planning experience.



 Features

- Preference Analyzer Agent
  Extracts genres, actors, and user preferences using NLP (NER, keyword extraction, or LLM).

- Movie Selector Agent
  Uses semantic search and a trained scikit-learn model to find and rank the best movies for the user.

- Schedule Creator Agent
  Integrates with Google Calendar to find optimal time slots and book events.

- Secure & Responsible AI
  Includes JWT authentication, input sanitization, fairness-aware recommendations, and explainable AI components.


 Tech Stack

 Layer         Tools / Frameworks 

 Frontend      React.js, Tailwind CSS 
 Backend       FastAPI (Python) 
 Models        scikit-learn, SentenceTransformers, LLM (e.g., LLaMA via Ollama) 
 NLP           spaCy, VADER, Transformers 
 IR / Search   FAISS or Qdrant 
 Auth          JWT (JSON Web Token) 
 APIs          TMDB API, Google Calendar API 
 Deployment    GitHub


Team Members 
