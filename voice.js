```javascript
(function () {
    "use strict";

    var HB = window.HealthBridge;
    var recognition = null;

    // Whether the user wants voice mode to remain active
    var listening = false;

    // Whether the user explicitly pressed Stop
    var userStopped = true;

    // Prevent multiple restart timers
    var restartTimer = null;

    function setStatus(text) {
        var el = document.getElementById("voiceStatus");
        if (el) {
            el.textContent = text;
        }
    }

    function getReply(transcript) {
        var lower = (transcript || "").toLowerCase();

        if (/medicine|medication|remind/.test(lower)) {
            return "I can help you manage your medication reminders. Open the Medication page to add times. Reminders only fire while this browser tab is active.";
        }

        if (/document/.test(lower)) {
            return "You can upload demo documents on the Documents page. Files stay in this browser.";
        }

        if (/doctor|communicate/.test(lower)) {
            return "Open Communication to message the demo care-team thread or the AI assistant.";
        }

        if (/emergency|chest pain|can't breathe/.test(lower)) {
            return "If this may be an emergency, contact local emergency services. I am a prototype and cannot provide emergency care.";
        }

        return "I heard you. I can help with reminders, documents, and simple healthcare explanations. I cannot diagnose or prescribe.";
    }

    function speak(text) {
        var voiceOn = localStorage.getItem("healthBridgeVoice") !== "off";

        if (!voiceOn) {
            if (HB && HB.showToast) {
                HB.showToast("Voice playback is off in Settings");
            }
            return;
        }

        if (!window.speechSynthesis) {
            if (HB && HB.showToast) {
                HB.showToast(
                    "Speech playback is not supported in this browser",
                    "error"
                );
            }
            return;
        }

        window.speechSynthesis.cancel();

        var utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";

        window.speechSynthesis.speak(utterance);
    }

    function showReply(transcript, reply) {
        var heard = document.getElementById("recognizedSpeech");
        var response = document.getElementById("assistantResponse");

        if (heard) {
            heard.textContent = transcript || "—";
        }

        if (response) {
            response.textContent = reply;
        }
    }

    function removeListeningUI() {
        var orb = document.getElementById("voiceOrb");

        if (orb) {
            orb.classList.remove("listening");
        }
    }

    function addListeningUI() {
        var orb = document.getElementById("voiceOrb");

        if (orb) {
            orb.classList.add("listening");
        }
    }

    function scheduleRestart() {
        if (!listening || userStopped) {
            return;
        }

        if (restartTimer) {
            clearTimeout(restartTimer);
        }

        restartTimer = setTimeout(function () {
            restartTimer = null;

            if (!listening || userStopped || !recognition) {
                return;
            }

            try {
                recognition.start();
                setStatus("Listening...");
                addListeningUI();
            } catch (error) {
                // Browser may still be finishing the previous session.
                // Try again shortly while the user still wants listening.
                scheduleRestart();
            }
        }, 300);
    }

    function createRecognition() {
        var Ctor =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!Ctor) {
            return null;
        }

        var rec = new Ctor();

        rec.lang = "en-US";

        // Keep recognition running as long as possible.
        rec.continuous = true;

        // Show speech while the user is speaking.
        rec.interimResults = true;

        rec.onstart = function () {
            if (listening && !userStopped) {
                setStatus("Listening...");
                addListeningUI();
            }
        };

        rec.onresult = function (event) {
            var finalTranscript = "";
            var interimTranscript = "";

            for (
                var i = event.resultIndex;
                i < event.results.length;
                i++
            ) {
                var chunk =
                    event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    finalTranscript += chunk;
                } else {
                    interimTranscript += chunk;
                }
            }

            // Show live speech immediately.
            if (interimTranscript) {
                var heardEl =
                    document.getElementById("recognizedSpeech");

                if (heardEl) {
                    heardEl.textContent =
                        interimTranscript;
                }
            }

            // When a sentence is finalized, show the response.
            if (finalTranscript) {
                var heardEl =
                    document.getElementById("recognizedSpeech");

                var currentText =
                    heardEl && heardEl.textContent
                        ? heardEl.textContent
                        : "";

                var fullText =
                    currentText && currentText !== "—"
                        ? currentText + " " + finalTranscript
                        : finalTranscript;

                fullText = fullText.trim();

                var reply = getReply(fullText);

                showReply(fullText, reply);

                // Read the response aloud.
                speak(reply);
            }
        };

        rec.onerror = function (event) {
            /*
             * These are normal browser recognition events.
             * Do NOT stop voice mode for them.
             */
            if (
                event.error === "no-speech" ||
                event.error === "aborted" ||
                event.error === "audio-capture"
            ) {
                if (listening && !userStopped) {
                    scheduleRestart();
                }

                return;
            }

            setStatus(
                "Could not capture speech. Try again, or type your question in Communication."
            );

            listening = false;
            userStopped = true;

            removeListeningUI();
        };

        rec.onend = function () {
            /*
             * IMPORTANT:
             *
             * Chrome can end SpeechRecognition automatically,
             * even when continuous=true.
             *
             * If the user did NOT press Stop, immediately start
             * another recognition session.
             */
            if (listening && !userStopped) {
                setStatus("Listening...");
                addListeningUI();

                scheduleRestart();
                return;
            }

            removeListeningUI();
        };

        return rec;
    }

    function getRecognition() {
        if (!recognition) {
            recognition = createRecognition();
        }

        return recognition;
    }

    function startListening() {
        var rec = getRecognition();

        if (!rec) {
            setStatus(
                "Speech recognition is not available in this browser. Chrome or Edge often work best."
            );

            var note =
                document.getElementById("unsupportedNote");

            if (note) {
                note.hidden = false;
            }

            return;
        }

        // User wants microphone to stay active.
        listening = true;
        userStopped = false;

        if (restartTimer) {
            clearTimeout(restartTimer);
            restartTimer = null;
        }

        addListeningUI();
        setStatus("Listening...");

        try {
            rec.start();
        } catch (error) {
            /*
             * If recognition is already running, do nothing.
             * Otherwise retry shortly.
             */
            scheduleRestart();
        }
    }

    function stopListening() {
        // User explicitly wants to stop.
        userStopped = true;
        listening = false;

        if (restartTimer) {
            clearTimeout(restartTimer);
            restartTimer = null;
        }

        if (recognition) {
            try {
                recognition.stop();
            } catch (error) {
                // Already stopped; nothing to do.
            }
        }

        removeListeningUI();
        setStatus("Stopped listening");
    }

    function speakResponse() {
        var response =
            document.getElementById("assistantResponse");

        var text =
            response && response.textContent
                ? response.textContent
                : "I am ready to help with medication reminders.";

        speak(text);
    }

    window.startListening = startListening;
    window.stopListening = stopListening;
    window.speakResponse = speakResponse;

    document.addEventListener("DOMContentLoaded", function () {
        var Ctor =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        var unsupportedNote =
            document.getElementById("unsupportedNote");

        if (!Ctor) {
            if (unsupportedNote) {
                unsupportedNote.hidden = false;
            }

            setStatus(
                "Speech recognition is not available in this browser."
            );

            return;
        }

        var startButton =
            document.getElementById("startListenBtn");

        var stopButton =
            document.getElementById("stopListenBtn");

        var speakButton =
            document.getElementById("speakBtn");

        if (startButton) {
            startButton.addEventListener(
                "click",
                startListening
            );
        }

        if (stopButton) {
            stopButton.addEventListener(
                "click",
                stopListening
            );
        }

        if (speakButton) {
            speakButton.addEventListener(
                "click",
                speakResponse
            );
        }
    });
})();
```
