# MovieRazzi — AI Movie Night Planner  

**MovieRazzi** is an AI-powered **multi-agent system** that helps users plan the perfect movie night.  
It understands your preferences, recommends the best movies, and automatically schedules viewing times — solving the everyday question *“What should I watch and when?”* using **NLP**, **LLMs**, and **Information Retrieval (IR)** in a secure and ethical way.  

---

##  Key Features  
**Preference Analyzer** – Detects genres, moods, and favorite actors using NLP and transformer models (BART, DistilBERT).  
 **Movie Retriever** – Fetches real-time movie data from TMDB using intelligent IR techniques.  
 **Schedule Creator** – Plans personalized watch times with AI-based scheduling and calendar integration.  
 **Secure & Ethical AI** – Includes JWT authentication, input validation, encryption, and adult-content filtering.  

---

##  Multi-Agent Architecture  


 **Preference Analyzer** - Understands user input and extracts genres, actors, and sentiments. 
**IR Agent**  Retrieves - relevant movies from TMDB based on detected preferences. 
 **Schedule Creator** -  Generates an optimized movie-watching schedule. 
 **Orchestrator Agent** -  Coordinates communication among all agents via FastAPI APIs. 

---

## Tech Highlights  
**Architecture:** Multi-agent system (4 agents via FastAPI)  
**AI Models:** Hugging Face Transformers (Zero-shot classification, Sentiment analysis)  
**NLP Tools:** SpaCy, Fuzzy string matching  
**APIs:** TMDB API, Google Calendar API  
**Frontend / Backend:** React.js + FastAPI  
**Deployment:** Docker-ready, HTTPS-enabled  

## Team Members
