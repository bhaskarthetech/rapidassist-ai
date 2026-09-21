from fastapi import FastAPI
from pydantic import BaseModel
from time import perf_counter

app = FastAPI(title="RapidAssist AI")


class AssistanceRequest(BaseModel):
    query: str
    session_id: str = "default"


@app.get("/")
def root():
    return {
        "project": "RapidAssist AI",
        "status": "running"
    }


@app.post("/assist")
def assist(request: AssistanceRequest):
    start = perf_counter()

    # Temporary retrieval placeholder.
    # Moss integration will be added here.
    context = "No retrieval context loaded yet."

    response = {
        "query": request.query,
        "context": context,
        "answer": (
            "RapidAssist received your request. "
            "Relevant operational guidance will be generated "
            "after the retrieval layer is connected."
        ),
        "session_id": request.session_id,
        "latency_ms": round((perf_counter() - start) * 1000, 2)
    }

    return response
