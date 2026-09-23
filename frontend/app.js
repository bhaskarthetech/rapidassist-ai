const micButton = document.getElementById("micButton");
const transcript = document.getElementById("transcript");
const response = document.getElementById("response");

const statusText = document.getElementById("status");
const retrievalLatency = document.getElementById("retrievalLatency");
const totalLatency = document.getElementById("totalLatency");

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;
let isListening = false;


// ==========================================
// CHECK BROWSER SUPPORT
// ==========================================

if (!SpeechRecognition) {

    statusText.textContent =
        "Voice recognition is not supported in this browser.";

    micButton.querySelector("span").textContent =
        "Voice not supported";

    console.error(
        "SpeechRecognition API is not supported."
    );

} else {

    // ==========================================
    // CREATE SPEECH RECOGNITION
    // ==========================================

    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;


    // ==========================================
    // WHEN LISTENING STARTS
    // ==========================================

    recognition.onstart = () => {

        isListening = true;

        statusText.textContent =
            "Listening...";

        micButton.querySelector("span").textContent =
            "Listening...";

        console.log("Speech recognition started");
    };


    // ==========================================
    // WHEN VOICE IS RECEIVED
    // ==========================================

    recognition.onresult = async (event) => {

        const query =
            event.results[0][0].transcript.trim();

        console.log("User said:", query);

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
                    `Backend returned ${result.status}`
                );
            }


            const data = await result.json();

            console.log("Backend response:", data);


            // Show AI response
            response.textContent =
                data.answer;


            // Show Moss latency
            if (
                data.retrieval_latency_ms !== undefined
            ) {

                retrievalLatency.textContent =
                    `${data.retrieval_latency_ms} ms`;
            }


            // Show total latency
            if (
                data.total_latency_ms !== undefined
            ) {

                totalLatency.textContent =
                    `${data.total_latency_ms} ms`;
            }


            statusText.textContent =
                "Response ready";


            // Speak response
            speak(data.answer);


        } catch (error) {

            console.error(
                "Backend error:",
                error
            );

            response.textContent =
                "Unable to connect to the RapidAssist backend.";

            statusText.textContent =
                "Backend connection error";
        }


        micButton.querySelector("span").textContent =
            "Start Voice Assistance";
    };


    // ==========================================
    // SPEECH RECOGNITION ERROR
    // ==========================================

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
                "Microphone unavailable";

        } else if (event.error === "network") {

            statusText.textContent =
                "Voice recognition network error";

        } else {

            statusText.textContent =
                "Voice error: " + event.error;
        }


        micButton.querySelector("span").textContent =
            "Start Voice Assistance";
    };


    // ==========================================
    // RECOGNITION ENDS
    // ==========================================

    recognition.onend = () => {

        console.log("Speech recognition ended");

        isListening = false;

        micButton.querySelector("span").textContent =
            "Start Voice Assistance";

        if (
            statusText.textContent ===
            "Listening..."
        ) {

            statusText.textContent =
                "Ready";
        }
    };


    // ==========================================
    // MICROPHONE BUTTON
    // ==========================================

    micButton.addEventListener(
        "click",
        async () => {

            console.log(
                "Voice button clicked"
            );


            if (isListening) {
                return;
            }


            statusText.textContent =
                "Starting microphone...";


            try {

                // Ask browser for microphone permission
                if (
                    navigator.mediaDevices &&
                    navigator.mediaDevices.getUserMedia
                ) {

                    const stream =
                        await navigator.mediaDevices.getUserMedia({
                            audio: true
                        });


                    console.log(
                        "Microphone permission granted"
                    );


                    // Stop temporary stream.
                    // SpeechRecognition will use microphone itself.
                    stream.getTracks().forEach(
                        track => track.stop()
                    );
                }


                // Start speech recognition
                recognition.start();


            } catch (error) {

                console.error(
                    "Microphone error:",
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

                } else if (
                    error.name ===
                    "InvalidStateError"
                ) {

                    statusText.textContent =
                        "Voice is already starting";

                } else {

                    statusText.textContent =
                        "Tap again to start voice";
                }
            }
        }
    );
}


// ==========================================
// TEXT TO SPEECH
// ==========================================

function speak(text) {

    if (
        !("speechSynthesis" in window)
    ) {

        console.log(
            "Text-to-speech not supported"
        );

        return;
    }


    const utterance =
        new SpeechSynthesisUtterance(text);


    utterance.lang = "en-IN";

    utterance.rate = 0.95;

    utterance.pitch = 1;


    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(
        utterance
    );
}
