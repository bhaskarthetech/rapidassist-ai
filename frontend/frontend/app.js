const micButton = document.getElementById("micButton");
const transcript = document.getElementById("transcript");
const response = document.getElementById("response");

const statusText = document.getElementById("status");
const retrievalLatency = document.getElementById("retrievalLatency");
const totalLatency = document.getElementById("totalLatency");

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;
let isListening = false;


// ===============================
// VOICE RECOGNITION
// ===============================

if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;


    recognition.onstart = () => {

        isListening = true;

        statusText.textContent = "Listening...";
        micButton.querySelector("span").textContent =
            "Listening...";
    };


    recognition.onresult = async (event) => {

        const query =
            event.results[0][0].transcript.trim();

        transcript.textContent = query;

        statusText.textContent =
            "Processing...";


        try {

            const result = await fetch(
                "/assist",
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


            if (!result.ok) {
                throw new Error(
                    `Server error: ${result.status}`
                );
            }


            const data = await result.json();


            response.textContent =
                data.answer;


            retrievalLatency.textContent =
                `${data.retrieval_latency_ms} ms`;


            totalLatency.textContent =
                `${data.total_latency_ms} ms`;


            statusText.textContent =
                "Response ready";


            speak(data.answer);


        } catch (error) {

            console.error("Backend error:", error);

            response.textContent =
                "Unable to connect to the RapidAssist backend.";

            statusText.textContent =
                "Backend connection error";
        }


        micButton.querySelector("span").textContent =
            "Start Voice Assistance";
    };


    recognition.onerror = (event) => {

        console.error(
            "Speech recognition error:",
            event.error
        );


        isListening = false;


        if (event.error === "not-allowed") {

            statusText.textContent =
                "Microphone permission denied";

        } else if (event.error === "no-speech") {

            statusText.textContent =
                "No speech detected. Try again.";

        } else if (event.error === "audio-capture") {

            statusText.textContent =
                "Microphone not available";

        } else {

            statusText.textContent =
                `Voice error: ${event.error}`;
        }


        micButton.querySelector("span").textContent =
            "Start Voice Assistance";
    };


    recognition.onend = () => {

        isListening = false;

        if (
            statusText.textContent ===
            "Listening..."
        ) {
            statusText.textContent =
                "Ready";
        }

        micButton.querySelector("span").textContent =
            "Start Voice Assistance";
    };


    // ===============================
    // START BUTTON
    // ===============================

    micButton.addEventListener("click", async () => {

        if (isListening) {
            return;
        }


        statusText.textContent =
            "Starting microphone...";


        try {

            // Ask microphone permission first
            if (
                navigator.mediaDevices &&
                navigator.mediaDevices.getUserMedia
            ) {

                const stream =
                    await navigator.mediaDevices.getUserMedia({
                        audio: true
                    });

                // Stop temporary microphone stream
                stream.getTracks().forEach(
                    track => track.stop()
                );
            }


            recognition.start();


        } catch (error) {

            console.error(
                "Microphone start error:",
                error
            );


            if (
                error.name ===
                "NotAllowedError"
            ) {

                statusText.textContent =
                    "Allow microphone permission";

            } else if (
                error.name ===
                "NotFoundError"
            ) {

                statusText.textContent =
                    "No microphone found";

            } else {

                statusText.textContent =
                    "Tap again to start voice";
            }
        }
    });


} else {

    // Browser doesn't support SpeechRecognition

    statusText.textContent =
        "Voice recognition not supported";

    micButton.querySelector("span").textContent =
        "Voice not supported";

    micButton.disabled = true;
}



// ===============================
// TEXT TO SPEECH
// ===============================

function speak(text) {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }


    const utterance =
        new SpeechSynthesisUtterance(text);


    utterance.lang = "en-IN";
    utterance.rate = 0.95;


    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(
        utterance
    );
}
