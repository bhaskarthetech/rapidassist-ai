def generate_response(query: str, documents: list) -> str:
    if not documents:
        return (
            "I could not find reliable guidance for this situation. "
            "Please refer to the equipment manual or contact trained personnel."
        )

    context = "\n\n".join(
        document["text"] for document in documents
    )

    return (
        "Based on the available operational guidance:\n\n"
        f"{context}\n\n"
        "Follow the applicable site safety procedure and use trained "
        "personnel for inspection or repair."
    )
