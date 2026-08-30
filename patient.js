(function () {
    "use strict";
    var HB = window.HealthBridge;

    function sendMessage() {
        var message = document.getElementById("message").value.trim();
        var language = document.getElementById("language").value;
        if (!message) {
            alert("Please enter your health concern.");
            return;
        }
        var time = new Date().toLocaleString();
        localStorage.setItem("patientMessage", message);
        localStorage.setItem("patientLanguage", language);
        localStorage.setItem("messageTime", time);
        var care = HB.readJson(HB.STORAGE.careChat, []);
        care.push({ sender: "patient", message: message, time: time });
        HB.writeJson(HB.STORAGE.careChat, care);
        HB.addActivity("Patient message sent");
        document.getElementById("result").textContent = "Your message has been sent to the doctor.";
        loadDoctorResponse();
        HB.showToast("Message sent");
    }

    function loadDoctorResponse() {
        var response = localStorage.getItem("doctorResponse");
        var care = HB.readJson(HB.STORAGE.careChat, []);
        var latest = care.filter(function (item) {
            return item.sender === "doctor";
        }).pop();
        var text = (latest && latest.message) || response;
        document.getElementById("doctorResponse").textContent = text || "No response from doctor yet.";
        document.getElementById("translatedDoctorResponse").textContent =
            text ? "Tamil translation will be added here." : "Translation will appear here.";
    }

    window.sendMessage = sendMessage;

    document.addEventListener("DOMContentLoaded", function () {
        loadDoctorResponse();
        var form = document.getElementById("patientForm");
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                sendMessage();
            });
        }
    });
})();
