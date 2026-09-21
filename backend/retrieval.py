import os
from moss import MossClient, QueryOptions

MOSS_PROJECT_ID = os.getenv("MOSS_PROJECT_ID")
MOSS_PROJECT_KEY = os.getenv("MOSS_PROJECT_KEY")
MOSS_INDEX_NAME = os.getenv("MOSS_INDEX_NAME", "rapidassist-knowledge")

if not MOSS_PROJECT_ID or not MOSS_PROJECT_KEY:
    raise RuntimeError(
        "MOSS_PROJECT_ID and MOSS_PROJECT_KEY environment variables are required."
    )

client = MossClient(
    MOSS_PROJECT_ID,
    MOSS_PROJECT_KEY
)

_index_loaded = False


async def load_moss_index():
    global _index_loaded

    if not _index_loaded:
        await client.load_index(MOSS_INDEX_NAME)
        _index_loaded = True


async def retrieve_context(query: str, top_k: int = 3):
    await load_moss_index()

    results = await client.query(
        MOSS_INDEX_NAME,
        query,
        QueryOptions(top_k=top_k)
    )

    documents = []

    for doc in results.docs:
        documents.append({
            "id": doc.id,
            "text": doc.text,
            "score": round(doc.score, 4)
        })

    return {
        "documents": documents,
        "retrieval_latency_ms": results.time_taken_ms
    }
