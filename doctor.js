(function () {
    "use strict";
    var HB = window.HealthBridge;

    function loadPatientMessage() {
        var message = localStorage.getItem("patientMessage");
        var language = localStorage.getItem("patientLanguage");
        var care = HB.readJson(HB.STORAGE.careChat, []);
        var latestPatient = care.filter(function (item) {
            return item.sender === "patient";
        }).pop();
        var display = message || (latestPatient && latestPatient.message);
        document.getElementById("patientMessage").textContent = display
            ? display + (language ? " (" + language + ")" : "")
            : "No patient message yet.";

        var translation = "Translation will appear here.";
        if (display && language === "tamil") {
            if (display.indexOf("தலைவலி") !== -1) {
                translation = "I have a headache.";
            } else if (display.indexOf("காய்ச்சல்") !== -1) {
                translation = "I have a fever.";
            } else if (display.indexOf("வயிற்று வலி") !== -1) {
                translation = "I have stomach pain.";
            } else if (display.indexOf("இருமல்") !== -1) {
                translation = "I have a cough.";
            } else if (display.indexOf("சளி") !== -1) {
                translation = "I have a cold.";
            } else {
                translation = "Translation is not available for this message yet.";
            }
        } else if (display) {
            translation = display;
        }
        document.getElementById("translatedMessage").textContent = translation;
    }

    function sendResponse() {
        var response = document.getElementById("doctorResponse").value.trim();
        if (!response) {
            alert("Please enter your response.");
            return;
        }
        var time = new Date().toLocaleString();
        localStorage.setItem("doctorResponse", response);
        localStorage.setItem("responseTime", time);
        var care = HB.readJson(HB.STORAGE.careChat, []);
        care.push({ sender: "doctor", message: response, time: time });
        HB.writeJson(HB.STORAGE.careChat, care);
        HB.addActivity("Care team response sent");
        document.getElementById("result").textContent = "Doctor response has been sent to the patient.";
        document.getElementById("doctorResponse").value = "";
        HB.showToast("Response saved");
    }

    window.sendResponse = sendResponse;

    document.addEventListener("DOMContentLoaded", function () {
        loadPatientMessage();
        var form = document.getElementById("doctorForm");
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                sendResponse();
            });
        }
    });
})();
