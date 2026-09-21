const micButton = document.getElementById("micButton");
const transcript = document.getElementById("transcript");
const response = document.getElementById("response");

const statusText = document.getElementById("status");
const retrievalLatency = document.getElementById("retrievalLatency");
const totalLatency = document.getElementById("totalLatency");

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;

if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        statusText.textContent = "Listening...";
        micButton.querySelector("span").textContent = "Listening...";
    };

    recognition.onresult = async (event) => {

        const query = event.results[0][0].transcript;

        transcript.textContent = query;
        statusText.textContent = "Processing...";

        try {

            const result = await fetch(
                "http://localhost:8000/assist",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        query: query,
                        session_id: "demo-session"
                    })
                }
            );

            const data = await result.json();

            response.textContent = data.answer;

            retrievalLatency.textContent =
                `${data.retrieval_latency_ms} ms`;

            totalLatency.textContent =
                `${data.total_latency_ms} ms`;

            statusText.textContent = "Response ready";

            speak(data.answer);

        } catch (error) {

            response.textContent =
                "Unable to connect to the RapidAssist backend.";

            statusText.textContent = "Connection error";
        }

        micButton.querySelector("span").textContent =
            "Start Voice Assistance";
    };

    recognition.onerror = () => {
        statusText.textContent = "Voice input error";
        micButton.querySelector("span").textContent =
            "Start Voice Assistance";
    };

    micButton.addEventListener("click", () => {
        recognition.start();
    });

} else {

    statusText.textContent =
        "Voice recognition is not supported in this browser.";

    micButton.disabled = true;
}


function speak(text) {

    if (!("speechSynthesis" in window)) {
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-IN";
    utterance.rate = 0.95;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}
