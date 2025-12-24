from __future__ import annotations

import os
import re
from typing import Any, Dict, List, Optional, Tuple

import spacy
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field


API_KEY = os.getenv("API_KEY", "")
MODEL_NAME = os.getenv("SPACY_MODEL", "en_core_web_sm")

# Load spaCy once at startup
nlp = spacy.load(MODEL_NAME)

app = FastAPI(title="Name + Heading Extractor", version="1.0.0")


# ---------- Heading detection (domain phrases) ----------
# Keep this conservative: only return headings we recognize.
TITLE_PHRASE_MAP: List[Tuple[re.Pattern[str], str]] = [
    (re.compile(r"congratulation[s]?\s+on\s+your\s+wedding\s+ceremony", re.I), "Congratulations On Your Wedding Ceremony"),
    (re.compile(r"congratulation[s]?\s+on\s+your\s+wedding", re.I), "Congratulations On Your Wedding"),
    (re.compile(r"congratulation[s]?\s+on\s+your\s+qur'?anic\s+(?:walima|walimah|walimat|walmia|walmiah|wamima|wamimat|wamimah)", re.I), "Congratulations On Your Qur'anic Walima"),
    (re.compile(r"congratulation[s]?\s+on\s+your\s+(?:walima|walimah|walimat|walmia|walmiah|wamima|wamimat|wamimah)", re.I), "Congratulations On Your Walima"),
    (re.compile(r"alhamdulillah[i]?\s+on\s+your\s+qur'?anic\s+walima", re.I), "Alhamdulillahi On Your Qur'anic Walima"),
    (re.compile(r"alhamdulillah[i]?\s+on\s+your\s+wedding\s+ceremony", re.I), "Alhamdulillahi On Your Wedding Ceremony"),
    (re.compile(r"alhamdulillah[i]?\s+on\s+your\s+wedding", re.I), "Alhamdulillahi On Your Wedding"),
    (re.compile(r"beautiful\s+beginning", re.I), "Beautiful Beginning"),
    (re.compile(r"conjugal\s+bliss", re.I), "Conjugal Bliss"),
    (re.compile(r"save\s+the\s+date", re.I), "Save The Date"),
    (re.compile(r"thank[s]?\s+for\s+attending", re.I), "Thanks For Attending"),
    (re.compile(r"best\s+wishes", re.I), "Best Wishes"),
    (re.compile(r"happy\s+wedding", re.I), "Happy Wedding"),
    (re.compile(r"with\s+love", re.I), "With Love"),
]


def find_heading(text: str) -> Tuple[Optional[str], str]:
    """Return (heading, text_without_heading)."""
    normalized = text.strip()
    lower = normalized.lower()

    for pattern, display in TITLE_PHRASE_MAP:
        if pattern.search(lower):
            # Remove all occurrences of that phrase to avoid contaminating name extraction.
            cleaned = pattern.sub(" ", normalized)
            cleaned = re.sub(r"\s+", " ", cleaned).strip()
            return display, cleaned

    return None, normalized


# ---------- Name extraction ----------
STOPWORDS = {
    "congratulation",
    "congratulations",
    "on",
    "your",
    "wedding",
    "ceremony",
    "quranic",
    "walima",
    "walimah",
    "walimat",
    "courtesy",
    "the",
    "main",
    "family",
    "from",
    "of",
    "and",
}


def _title_case_name(name: str) -> str:
    parts = [p for p in re.split(r"\s+", name.strip()) if p]
    return " ".join(p[:1].upper() + p[1:].lower() if p else p for p in parts)


def _looks_like_name_token(token: str) -> bool:
    if not token:
        return False
    t = re.sub(r"[^A-Za-z'\-]", "", token)
    if len(t) < 2:
        return False
    if t.lower() in STOPWORDS:
        return False
    return bool(re.fullmatch(r"[A-Za-z][A-Za-z'\-]+", t))


def extract_names(text: str) -> Dict[str, Optional[str]]:
    """Extract up to two names. Uses: shared-surname heuristic + spaCy PERSON entities."""
    cleaned = text.strip()

    # 1) Shared-surname heuristic: "A & B Surname" / "A and B Surname"
    shared_amp = re.search(r"\b([A-Za-z][A-Za-z'\-]+)\s*&\s*([A-Za-z][A-Za-z'\-]+)\s+([A-Za-z][A-Za-z'\-]+)\b", cleaned)
    if shared_amp:
        a, b, surname = shared_amp.group(1), shared_amp.group(2), shared_amp.group(3)
        if all(_looks_like_name_token(x) for x in (a, b, surname)):
            return {
                "name1": _title_case_name(f"{a} {surname}"),
                "name2": _title_case_name(f"{b} {surname}"),
                "method": "shared_surname_amp",
            }

    shared_and = re.search(r"\b([A-Za-z][A-Za-z'\-]+)\s+(?:and|n)\s+([A-Za-z][A-Za-z'\-]+)\s+([A-Za-z][A-Za-z'\-]+)\b", cleaned, re.I)
    if shared_and:
        a, b, surname = shared_and.group(1), shared_and.group(2), shared_and.group(3)
        if all(_looks_like_name_token(x) for x in (a, b, surname)):
            return {
                "name1": _title_case_name(f"{a} {surname}"),
                "name2": _title_case_name(f"{b} {surname}"),
                "method": "shared_surname_and",
            }

    # 2) spaCy PERSON entities
    doc = nlp(cleaned)
    persons: List[str] = []
    for ent in doc.ents:
        if ent.label_ != "PERSON":
            continue
        # Drop single stopword-like entities
        ent_text = ent.text.strip()
        if not ent_text:
            continue
        if ent_text.lower() in STOPWORDS:
            continue
        persons.append(ent_text)

    # Deduplicate while preserving order
    seen = set()
    uniq: List[str] = []
    for p in persons:
        key = re.sub(r"\s+", " ", p.lower())
        if key in seen:
            continue
        seen.add(key)
        uniq.append(p)

    if not uniq:
        # 3) ultra-light fallback: look for "A & B" first names only
        m = re.search(r"\b([A-Za-z][A-Za-z'\-]+)\s*&\s*([A-Za-z][A-Za-z'\-]+)\b", cleaned)
        if m and all(_looks_like_name_token(x) for x in (m.group(1), m.group(2))):
            return {
                "name1": _title_case_name(m.group(1)),
                "name2": _title_case_name(m.group(2)),
                "method": "fallback_amp",
            }
        return {"name1": None, "name2": None, "method": "none"}

    name1 = _title_case_name(uniq[0])
    name2 = _title_case_name(uniq[1]) if len(uniq) > 1 else None
    return {"name1": name1, "name2": name2, "method": "spacy_person"}


# ---------- API schema ----------
class ExtractRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=4000)


class ExtractResponse(BaseModel):
    heading: Optional[str]
    names: Dict[str, Optional[str]]
    text_without_heading: str


def require_api_key(x_api_key: Optional[str]) -> None:
    if not API_KEY:
        # If API_KEY is not configured, allow all (useful for local testing).
        return
    if not x_api_key or x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.get("/health")
def health() -> Dict[str, Any]:
    return {"ok": True, "model": MODEL_NAME}


@app.post("/extract", response_model=ExtractResponse)
def extract(payload: ExtractRequest, x_api_key: Optional[str] = Header(default=None)) -> ExtractResponse:
    require_api_key(x_api_key)

    heading, text_wo_heading = find_heading(payload.text)
    names = extract_names(text_wo_heading)

    # Strip the internal method unless you want it; keep it for debugging.
    return ExtractResponse(
        heading=heading,
        names={"name1": names.get("name1"), "name2": names.get("name2"), "method": names.get("method")},
        text_without_heading=text_wo_heading,
    )
