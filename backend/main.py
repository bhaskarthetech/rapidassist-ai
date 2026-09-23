from pathlib import Path
from time import perf_counter

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from retrieval import retrieve_context
from agent import generate_response

HIGH_RISK_KEYWORDS = [
    "fire",
    "smoke",
    "electrical spark",
    "exposed wire",
    "electric shock",
    "gas leak",
    "fuel leak",
    "explosion",
    "uncontrolled movement",
]


def validate_response(query: str, answer: str) -> str:
    combined_text = f"{query} {answer}".lower()

    for keyword in HIGH_RISK_KEYWORDS:
        if keyword in combined_text:
            return (
                "SAFETY ALERT: A potentially hazardous condition was detected. "
                "Keep people away from the equipment and follow the site's "
                "emergency shutdown and safety procedure. "
                "Only trained and authorized personnel should inspect or repair "
                "the equipment."
            )

    return answer

app = FastAPI(title="RapidAssist AI")


class AssistanceRequest(BaseModel):
    query: str
    session_id: str = "default"


BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"


@app.get("/")
def root():
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/health")
def health():
    return {
        "project": "RapidAssist AI",
        "status": "running",
        "retrieval": "Moss"
    }


@app.post("/assist")
async def assist(request: AssistanceRequest):
    start = perf_counter()

    retrieval = await retrieve_context(request.query)

    documents = retrieval["documents"]
    retrieval_latency = retrieval["retrieval_latency_ms"]

    answer = generate_response(
        request.query,
        documents
    )

    answer = validate_response(
        request.query,
        answer
    )

    total_latency = round(
        (perf_counter() - start) * 1000,
        2
    )

    return {
        "query": request.query,
        "answer": answer,
        "sources": documents,
        "retrieval_latency_ms": retrieval_latency,
        "total_latency_ms": total_latency,
        "session_id": request.session_id
    }


app.mount(
    "/",
    StaticFiles(directory=FRONTEND_DIR),
    name="frontend"
)
