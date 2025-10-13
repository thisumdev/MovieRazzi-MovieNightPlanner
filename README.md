MovieRazzi — AI-Powered Movie Night Planner

MovieRazzi is an AI-powered multi-agent system that helps users plan the perfect movie night.
It understands user preferences, recommends the best movies, and automatically schedules viewing times — all using cutting-edge NLP, LLMs, and Information Retrieval (IR) technologies.

Overview

Domain: Personalized Movie Recommendation and Scheduling

Problem Solved:
Choosing what to watch and when can be overwhelming. MovieRazzi reduces this decision fatigue by understanding user moods and preferences, retrieving suitable movies, and planning an ideal schedule.

 Core Features
1.Preference Analyzer Agent

Extracts genres, actors, and sentiments from user input using SpaCy and transformer-based models.

Performs zero-shot genre classification and sentiment analysis via Hugging Face pipelines (facebook/bart-large-mnli, distilbert-base-uncased-finetuned-sst-2-english).

Detects entities (e.g., actors, directors) and corrects spelling errors with fuzzy string matching.

2.Information Retrieval (IR) Agent

Fetches real-time movie data from the TMDB API.

Performs keyword-based and entity-based searches to retrieve movies aligned with the detected preferences.

Applies filtering and enrichment operations for accuracy and relevance.

3.Schedule Creator Agent

Analyzes user’s free time and creates a personalized viewing schedule automatically.

Supports calendar integration (e.g., Google Calendar API).

4.Orchestrator Agent

Manages communication among all agents through FastAPI REST endpoints.

Ensures smooth data flow between agents for a cohesive experience.

Multi-Agent Architecture
Agent	Role	File
Preference Analyzer	Extracts genres, sentiment, entities	preference_analyzer.py
IR Agent	Retrieves and filters movies	ir_agent.py
Schedule Creator	Generates personalized schedules	schedule_creator_agent.py
Orchestrator	Manages inter-agent workflow	orchestrator_agent.py

Agents communicate via structured HTTP APIs, ensuring modularity and scalability.

Use of AI, NLP, and LLMs

NLP Techniques: Entity Recognition (NER), Sentiment Analysis, Keyword Extraction

LLMs: Hugging Face transformer models for classification and emotion detection

IR: TMDB API queries for real-time movie retrieval

Hybrid Reasoning: Combines rule-based and deep learning-based NLP

Security and Responsible AI

Authentication: JWT-based user login/signup

Input Validation: Pydantic models for sanitization

Password Hashing: Secure hashing for stored credentials

HTTPS Enforcement: Enabled in FastAPI middleware

Explainable AI: Recommendations include reasoning (e.g., “Stars Tom Holland and matches your interest in action movies”)

Ethical Filters: Blocks adult or unsafe content automatically

Data Privacy: No persistent user data storage — all data handled transiently


Team Members 
