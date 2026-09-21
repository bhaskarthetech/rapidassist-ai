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
