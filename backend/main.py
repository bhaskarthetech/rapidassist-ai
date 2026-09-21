from retrieval import retrieve_context
from agent import generate_response
from safety import validate_response
from fastapi import FastAPI
from pydantic import BaseModel
from time import perf_counter

from retrieval import retrieve_context


app = FastAPI(title="RapidAssist AI")


class AssistanceRequest(BaseModel):
    query: str
    session_id: str = "default"


@app.get("/")
def root():
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
)
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
