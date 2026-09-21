import os
import asyncio
from moss import MossClient

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


KNOWLEDGE = [
    {
        "id": "generator-overheating",
        "text": (
            "Generator overheating can be caused by restricted airflow, "
            "low coolant level, excessive load, or a cooling-system issue. "
            "First keep personnel clear of moving and hot components. "
            "If the situation is unsafe, stop operation according to the "
            "site emergency procedure. Do not open a hot cooling system. "
            "A qualified technician should inspect the equipment before "
            "returning it to service."
        )
    },
    {
        "id": "generator-pressure-drop",
        "text": (
            "A sudden generator pressure drop may indicate a system fault, "
            "leak, insufficient fluid level, or abnormal operating condition. "
            "Check the equipment display and visible warning indicators from "
            "a safe position. Do not remove guards or open pressurized systems "
            "while the equipment is operating. If a leak, smoke, fire, or "
            "dangerous condition is observed, stop operation and follow the "
            "site emergency procedure."
        )
    },
    {
        "id": "machine-emergency",
        "text": (
            "If equipment shows smoke, fire, exposed electrical parts, "
            "uncontrolled movement, or another immediate hazard, keep people "
            "away from the area and follow the site's emergency shutdown "
            "procedure. Only trained and authorized personnel should perform "
            "equipment isolation or repair."
        )
    },
    {
        "id": "routine-equipment-check",
        "text": (
            "Before operating industrial equipment, check for visible damage, "
            "warning indicators, unusual leaks, abnormal sounds, and other "
            "obvious signs of malfunction. Follow the equipment manufacturer's "
            "manual and site safety procedure. Maintenance and repair should "
            "be performed only by trained personnel."
        )
    }
]


async def main():
    print("Creating RapidAssist Moss knowledge index...")

    await client.create_index(
        MOSS_INDEX_NAME,
        KNOWLEDGE
    )

    print(f"Index created: {MOSS_INDEX_NAME}")
    print(f"Documents added: {len(KNOWLEDGE)}")


if __name__ == "__main__":
    asyncio.run(main())
