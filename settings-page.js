(function () {
    "use strict";

    function saveSettings() {
        var language = document.getElementById("language").value;
        var voice = document.getElementById("voice").value;
        var fontSize = document.getElementById("fontSize").value;
        var contrast = document.getElementById("contrast").value;
        var theme = document.getElementById("theme").value;
        var notifications = document.getElementById("notifications").value;
        var privacy = document.getElementById("privacy").value;
        var medNotify = document.getElementById("medNotifications").value;
        var commNotify = document.getElementById("commNotifications").value;
        var reducedMotion = document.getElementById("reducedMotion").value;

        localStorage.setItem("healthBridgeLanguage", language);
        localStorage.setItem("healthBridgeVoice", voice);
        localStorage.setItem("healthBridgeFontSize", fontSize);
        localStorage.setItem("healthBridgeContrast", contrast);
        localStorage.setItem("healthBridgeTheme", theme);
        localStorage.setItem("healthBridgeNotifications", notifications);
        localStorage.setItem("healthBridgePrivacy", privacy);
        localStorage.setItem("healthBridgeMedNotify", medNotify);
        localStorage.setItem("healthBridgeCommNotify", commNotify);
        localStorage.setItem("healthBridgeReducedMotion", reducedMotion);

        var api = window.HealthBridgeSettings;
        api.applyFontSize(fontSize);
        api.applyTheme(theme);
        api.applyContrast(contrast);
        api.applyReducedMotion(reducedMotion);

        var result = document.getElementById("result");
        if (result) {
            result.textContent = "Settings saved successfully.";
        }
        if (window.HealthBridge) {
            window.HealthBridge.showToast("Settings saved");
        }
    }

    function loadSettings() {
        var pairs = {
            language: "healthBridgeLanguage",
            voice: "healthBridgeVoice",
            fontSize: "healthBridgeFontSize",
            contrast: "healthBridgeContrast",
            theme: "healthBridgeTheme",
            notifications: "healthBridgeNotifications",
            privacy: "healthBridgePrivacy",
            medNotifications: "healthBridgeMedNotify",
            commNotifications: "healthBridgeCommNotify",
            reducedMotion: "healthBridgeReducedMotion"
        };
        Object.keys(pairs).forEach(function (id) {
            var el = document.getElementById(id);
            var value = localStorage.getItem(pairs[id]);
            if (el && value) {
                el.value = value;
            }
        });
        if (!document.getElementById("fontSize").value) {
            document.getElementById("fontSize").value = "medium";
        }
    }

    window.saveSettings = saveSettings;

    document.addEventListener("DOMContentLoaded", function () {
        loadSettings();
        var form = document.getElementById("settingsForm");
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                saveSettings();
            });
        }
        document.querySelectorAll("[data-settings-tab]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var tab = btn.getAttribute("data-settings-tab");
                document.querySelectorAll("[data-settings-tab]").forEach(function (item) {
                    item.classList.toggle("active", item === btn);
                });
                document.querySelectorAll(".setting-block").forEach(function (block) {
                    block.classList.toggle("active", block.id === "settings-" + tab);
                });
            });
        });
        ["theme", "fontSize", "contrast", "reducedMotion"].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) {
                el.addEventListener("change", saveSettings);
            }
        });
    });
})();
