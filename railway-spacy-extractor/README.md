# Railway spaCy Name + Heading Extractor

Small FastAPI service you can deploy to Railway to extract:
- a **known heading** (wedding title phrases)
- **person names** (spaCy NER + shared-surname heuristic)

## Endpoints
- `GET /health`
- `POST /extract`

## Environment variables
- `API_KEY` (optional but recommended) – if set, requests must include header `x-api-key: <API_KEY>`
- `SPACY_MODEL` (optional) – defaults to `en_core_web_sm`

## Local run
```bash
cd railway-spacy-extractor
python -m venv .venv
. .venv/bin/activate  # (Windows PowerShell: .venv\Scripts\Activate.ps1)
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --reload --port 8000
```

## Test
```bash
curl -X POST http://localhost:8000/extract \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"congratulation on your quranic wamimat Aishatu & Amina Muhammad on 6th December, 2023 courtesy: the main family\"}"
```

## Deploy to Railway
1) Push this folder to GitHub (or add it to your repo).
2) Railway → **New Project** → **Deploy from GitHub repo**.
3) In Railway settings:
   - **Root Directory**: `railway-spacy-extractor`
   - Railway will build using the `Dockerfile`.
4) Add env var `API_KEY` in Railway.
5) Deploy.

## Recommended usage from your app
Don’t call Railway directly from the browser with `API_KEY`.
Instead, call from your backend (Firebase Functions / your Node server) and keep the key server-side.
