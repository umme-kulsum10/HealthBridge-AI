(function () {
    "use strict";
    var HB = window.HealthBridge;
    var API = "/api/ai/chat";
    var mode = "ai";
    var chatHistory = [];
    var careHistory = [];

    var DEMO_REPLIES = [
        {
            test: function (m) { return /hello|hi\b|hey/.test(m); },
            reply: "Hello. I can help explain healthcare information in simple language. I cannot diagnose conditions or replace a clinician."
        },
        {
            test: function (m) { return /term|mean|hypertension|diabetes|anemia|asthma/.test(m); },
            reply: "I can explain common medical terms in plain language. For a personal interpretation of your records, ask your care team. You can also open the Medical Terms page."
        },
        {
            test: function (m) { return /medication|schedule|tablet|remind/.test(m); },
            reply: "Your medication schedule is on the Medication page. I can help you remember times you already entered. I cannot prescribe or change doses."
        },
        {
            test: function (m) { return /doctor|ask|appointment/.test(m); },
            reply: "Useful questions for a clinician include: What is this for? What side effects should I watch for? When should I follow up? Bring your medication list and documents."
        },
        {
            test: function (m) { return /document|report|lab/.test(m); },
            reply: "I can help you think about how to read a document in simple language. Upload files on the Documents page. This prototype does not analyze files on a medical server."
        },
        {
            test: function (m) { return /chest pain|can't breathe|cannot breathe|suicide|emergency|severe bleeding/.test(m); },
            reply: "If this could be an emergency, seek urgent medical care now (local emergency services). I am a prototype assistant and cannot provide emergency treatment."
        }
    ];

    var FALLBACK =
        "I can help explain healthcare information, medical terms, and how to use this prototype. I do not diagnose, prescribe, or replace a qualified healthcare professional.";

    function getDemoReply(message) {
        var lower = message.toLowerCase();
        for (var i = 0; i < DEMO_REPLIES.length; i += 1) {
            if (DEMO_REPLIES[i].test(lower)) {
                return DEMO_REPLIES[i].reply;
            }
        }
        return FALLBACK;
    }

    /**
     * Swap this function to call a real backend later.
     * Keep API keys on the server — never in frontend JavaScript.
     */
    function requestAssistantReply(message) {
        return fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message })
        }).then(function (res) {
            if (!res.ok) {
                throw new Error("API unavailable");
            }
            return res.json();
        }).then(function (data) {
            return data.reply || FALLBACK;
        }).catch(function () {
            return getDemoReply(message);
        });
    }

    function loadChats() {
        chatHistory = HB.readJson(HB.STORAGE.chat, []);
        careHistory = HB.readJson(HB.STORAGE.careChat, []);
        migrateLegacyCareChat();
        renderThread();
    }

    function migrateLegacyCareChat() {
        var patientMessage = localStorage.getItem("patientMessage");
        var doctorResponse = localStorage.getItem("doctorResponse");
        var messageTime = localStorage.getItem("messageTime");
        var responseTime = localStorage.getItem("responseTime");
        if (careHistory.length > 0) {
            return;
        }
        if (patientMessage) {
            careHistory.push({
                sender: "patient",
                message: patientMessage,
                time: messageTime || new Date().toLocaleString()
            });
        }
        if (doctorResponse) {
            careHistory.push({
                sender: "doctor",
                message: doctorResponse,
                time: responseTime || new Date().toLocaleString()
            });
        }
        if (careHistory.length) {
            HB.writeJson(HB.STORAGE.careChat, careHistory);
        }
    }

    function currentHistory() {
        return mode === "care" ? careHistory : chatHistory;
    }

    function saveCurrent() {
        if (mode === "care") {
            HB.writeJson(HB.STORAGE.careChat, careHistory);
        } else {
            HB.writeJson(HB.STORAGE.chat, chatHistory);
        }
    }

    function addBubble(sender, message, time) {
        var chatBox = document.getElementById("chatBox");
        var div = document.createElement("div");
        var cls = "chat-message";
        if (sender === "user" || sender === "patient") {
            cls += sender === "patient" ? " patient-bubble" : " user-message";
        } else if (sender === "doctor") {
            cls += " doctor-message";
        } else {
            cls += " ai-message";
        }
        div.className = cls;
        var labels = {
            user: "You",
            ai: "HealthBridge AI",
            patient: "Patient",
            doctor: "Care team"
        };
        div.innerHTML =
            "<div class='message-label'>" + (labels[sender] || sender) + "</div>" +
            "<div class='message-text'></div>" +
            "<div class='message-meta'>" + HB.escapeHtml(time || "") + "</div>";
        div.querySelector(".message-text").textContent = message;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function renderThread() {
        var chatBox = document.getElementById("chatBox");
        if (!chatBox) {
            return;
        }
        chatBox.innerHTML = "";
        var history = currentHistory();
        if (history.length === 0) {
            if (mode === "ai") {
                addBubble("ai", "Hello. I am HealthBridge AI, a prototype assistant. I can help explain healthcare information in simple language. I cannot diagnose or prescribe.", new Date().toLocaleString());
            } else {
                addBubble("ai", "This is a demo care-team conversation. Messages stay in this browser unless you connect a backend.", new Date().toLocaleString());
            }
            return;
        }
        history.forEach(function (item) {
            addBubble(item.sender, item.message, item.time);
        });
    }

    function setTyping(on) {
        var el = document.getElementById("typingIndicator");
        if (el) {
            el.hidden = !on;
        }
    }

    function sendMessage() {
        var input = document.getElementById("userInput");
        var message = input.value.trim();
        if (!message) {
            return;
        }
        var time = new Date().toLocaleString();
        if (mode === "ai") {
            chatHistory.push({ sender: "user", message: message, time: time });
            saveCurrent();
            addBubble("user", message, time);
            input.value = "";
            setTyping(true);
            requestAssistantReply(message).then(function (reply) {
                setTyping(false);
                var stamp = new Date().toLocaleString();
                chatHistory.push({ sender: "ai", message: reply, time: stamp });
                saveCurrent();
                addBubble("ai", reply, stamp);
                HB.addActivity("AI assistant conversation updated");
            });
        } else {
            careHistory.push({ sender: "patient", message: message, time: time });
            localStorage.setItem("patientMessage", message);
            localStorage.setItem("patientLanguage", "english");
            localStorage.setItem("messageTime", time);
            saveCurrent();
            addBubble("patient", message, time);
            input.value = "";
            HB.addActivity("Communication started");
            HB.showToast("Message added to care-team thread");
        }
    }

    function clearChat() {
        if (!confirm("Clear this conversation?")) {
            return;
        }
        if (mode === "ai") {
            chatHistory = [];
            localStorage.removeItem(HB.STORAGE.chat);
        } else {
            careHistory = [];
            localStorage.removeItem(HB.STORAGE.careChat);
        }
        renderThread();
    }

    function setMode(next) {
        mode = next;
        document.querySelectorAll(".tab[data-mode]").forEach(function (tab) {
            tab.classList.toggle("active", tab.getAttribute("data-mode") === mode);
        });
        var input = document.getElementById("userInput");
        if (input) {
            input.placeholder = mode === "ai"
                ? "Ask a healthcare question..."
                : "Write a message for the care team...";
        }
        renderThread();
    }

    window.sendMessage = sendMessage;
    window.clearChat = clearChat;
    window.generateAIResponse = function (message) {
        requestAssistantReply(message).then(function (reply) {
            addBubble("ai", reply, new Date().toLocaleString());
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        loadChats();
        var form = document.getElementById("chatForm");
        var input = document.getElementById("userInput");
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                sendMessage();
            });
        }
        if (input) {
            input.addEventListener("keydown", function (event) {
                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                }
            });
        }
        document.querySelectorAll(".tab[data-mode]").forEach(function (tab) {
            tab.addEventListener("click", function () {
                setMode(tab.getAttribute("data-mode"));
            });
        });
        document.querySelectorAll("[data-suggest]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                setMode("ai");
                document.getElementById("userInput").value = btn.getAttribute("data-suggest");
                sendMessage();
            });
        });
        var clearBtn = document.getElementById("clearChatBtn");
        if (clearBtn) {
            clearBtn.addEventListener("click", clearChat);
        }
    });
})();
