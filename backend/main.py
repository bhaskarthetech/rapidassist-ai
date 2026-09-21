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

    if documents:
        context = "\n\n".join(
            [
                f"Source {i + 1}:\n{doc['text']}"
                for i, doc in enumerate(documents)
            ]
        )

        answer = (
            "I found relevant operational guidance. "
            "Please follow the applicable site safety procedure.\n\n"
            + context
        )
    else:
        context = "No relevant operational guidance found."

        answer = (
            "I could not find reliable guidance for this situation. "
            "Please refer to the equipment manual or contact trained personnel."
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
