from typing import Dict, List, Optional
import re

def analyze_preferences(user_input: str) -> Dict:
    """
    Analyzes user input and extracts movie preferences.
    """

    # Predefined genres for matching
    genres_list = ["action", "romance", "comedy", "romantic", "thriller", "horror", "drama", "sci-fi"]
    genres = [g.title() for g in genres_list if g in user_input.lower()]

    # Extract duration from input if mentioned
    duration = None
    match = re.search(r"(\d+)\s*(hours|hrs|min|minutes)", user_input.lower())
    if match:
        duration = int(match.group(1)) * (60 if "hour" in match.group(2) else 1)

    # Simple actor name detection (two consecutive capitalized words)
    actors = []
    words = user_input.split()
    for i in range(len(words) - 1):
        if words[i][0].isupper() and words[i + 1][0].isupper():
            actors.append(f"{words[i]} {words[i + 1]}")

    # Final preferences
    return {
        "genre": genres if genres else ["Any"],
        "preferred_actors": actors,
        "language": "English",
        "duration_limit": duration,
    }