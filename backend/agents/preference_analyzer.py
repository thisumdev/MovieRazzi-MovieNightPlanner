import os, logging, re
from fuzzywuzzy import fuzz
import spacy
import torch
from transformers import pipeline

logger = logging.getLogger("preference_agent")

# Named Entity Recognition (NER) for detecting actor/person names
try:
    nlp = spacy.load("en_core_web_trf")
    logger.info("✅ Loaded SpaCy transformer model (en_core_web_trf)")
except Exception:
    nlp = spacy.load("en_core_web_sm")
    logger.warning("⚠️ Using fallback SpaCy small model (en_core_web_sm)")

# Sentiment analysis component
sentiment_pipe = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english",
    device=0 if torch.cuda.is_available() else -1,
)

# Genre labels
GENRES = [
    "action", "romance", "comedy", "drama", "thriller", "horror",
    "fantasy", "sci-fi", "animation", "adventure"
]

# Load the BART zero-shot model
try:
    genre_pipe = pipeline(
        "zero-shot-classification",
        model="facebook/bart-large-mnli",
        device=0 if torch.cuda.is_available() else -1,
    )
    print("✅ BART zero-shot genre model loaded successfully.")
except Exception as e:
    print(f"⚠️ Could not load BART genre classifier: {e}")
    genre_pipe = None

# Known actors for fuzzy correction
KNOWN_ACTORS = [
    "Tom Holland", "Zendaya", "Dwayne Johnson", "Chris Hemsworth",
    "Robert Downey Jr", "Scarlett Johansson", "Emma Stone", "Ryan Gosling",
    "Chris Evans", "Tom Cruise", "Margot Robbie", "Hugh Jackman", "Gal Gadot",
    "Ryan Reynolds", "Benedict Cumberbatch", "Vin Diesel", "Mark Ruffalo",
    "Matthew Perry", "Leonardo DiCaprio", "Natalie Portman", "Anne Hathaway",
    "Florence Pugh", "Cillian Murphy", "Timothée Chalamet", "Will Smith",
    "Brad Pitt", "Angelina Jolie", "Keanu Reeves", "Henry Cavill"
]

# Keyword-based fallback system
GENRE_KEYWORDS = {
    "action": ["fight", "hero", "battle", "war", "chase", "mission", "explosion"],
    "romance": ["love", "romantic", "relationship", "heart", "kiss"],
    "comedy": ["funny", "laugh", "humor", "comedy", "joke"],
    "drama": ["emotional", "life", "story", "family", "tear"],
    "thriller": ["mystery", "suspense", "crime", "detective", "thriller"],
    "horror": ["scary", "ghost", "monster", "haunted", "horror"],
    "fantasy": ["magic", "wizard", "dragon", "kingdom", "fairy"],
    "sci-fi": ["space", "robot", "future", "alien", "sci-fi"],
    "animation": ["cartoon", "animated", "pixar", "disney"],
    "adventure": ["journey", "explore", "quest", "adventure"],
}

# A blocklist of adult/explicit keywords
ADULT_KEYWORDS = [
    "adult", "xxx", "porn", "sex", "erotic", "explicit", "nsfw", "nude", "18+", "fetish"
]

# Actor name extraction
def extract_entities(text: str):
    doc = nlp(text)
    people = {ent.text.strip() for ent in doc.ents if ent.label_ == "PERSON"}

    # fuzzy match to known actors
    for actor in KNOWN_ACTORS:
        if fuzz.partial_ratio(actor.lower(), text.lower()) > 87:
            people.add(actor)

    #Deduplicate similar names
    clean_people = []
    for p in sorted(people):
        if not any(fuzz.ratio(p.lower(), existing.lower()) > 85 for existing in clean_people):
            clean_people.append(p)

    return {"people": clean_people}


# Genre detection (hybrid)
def classify_genre(text: str):
    genres = set()

    # Try zero-shot model
    if genre_pipe:
        print("🎬 Using BART zero-shot model for genre detection...")
        result = genre_pipe(text, candidate_labels=GENRES, multi_label=True)
        pairs = list(zip(result["labels"], result["scores"]))
        top_two = sorted(pairs, key=lambda x: x[1], reverse=True)[:2]
        for label, score in top_two:
            if score >= 0.25:  # confidence threshold
                genres.add(label.lower())
    else:
        print("⚠️ BART model not loaded — skipping to fallback.")

    # Fallback keyword method
    if not genres:
        print("🪄 Using keyword-based fallback for genre detection...")
        low = text.lower()
        for g, words in GENRE_KEYWORDS.items():
            if any(w in low for w in words):
                genres.add(g)

    return sorted(genres) or ["unspecified"]

# Sentiment analysis function
def analyze_sentiment(text: str):
    res = sentiment_pipe(text[:512])[0]
    label = res["label"].lower()
    sentiment = (
        "positive" if "pos" in label
        else "negative" if "neg" in label
        else "neutral"
    )
    return {"sentiment": sentiment, "score": round(res["score"], 3)}

# Main analyzer function
def analyze_preferences(user_input: str):
    if not user_input.strip():
        return {"error": "Empty input"}

    lower_input = user_input.lower()
    if any(word in lower_input for word in ADULT_KEYWORDS):
        return {
            "error": "⚠️ Adult content detected. MovieRazzi cannot recommend explicit or NSFW movies. Please try again with family-safe preferences."
        }

    entities = extract_entities(user_input)
    genres = classify_genre(user_input)
    sentiment = analyze_sentiment(user_input)

    summary = (
        f"The user seems {sentiment['sentiment']} about movies. "
        f"They prefer {', '.join(genres)}."
    )
    if entities["people"]:
        summary += f" They mentioned {', '.join(entities['people'])}."

    return {
        "input_text": user_input,
        "detected_genres": genres,
        "entities": entities,
        "sentiment": sentiment,
        "summary": summary,
    }
