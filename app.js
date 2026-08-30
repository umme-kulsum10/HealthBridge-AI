```javascript
(function () {
    "use strict";

    var STORAGE = {
        medicines: "healthBridgeMedicines",
        chat: "healthBridgeChat",
        careChat: "healthBridgeCareChat",
        documents: "healthBridgeDocuments",
        profile: "healthBridgeProfile",
        activity: "healthBridgeActivity",
        notifications: "healthBridgeNotifications",
        medNotifications: "healthBridgeMedNotify",
        commNotifications: "healthBridgeCommNotify",
        demoSeeded: "healthBridgeDemoSeeded"
    };

    /*
     * IMPORTANT:
     * No fake patient profile is created here.
     * The profile stays blank until the patient saves it.
     */
    var DEFAULT_PROFILE = {
        name: "",
        age: "",
        gender: "",
        bloodGroup: "",
        phone: "",
        email: "",
        emergency: "",
        notes: ""
    };

    // Remove old demo profile if it exists
try {
    var oldProfile = localStorage.getItem(STORAGE.profile);

    if (oldProfile) {
        var parsedProfile = JSON.parse(oldProfile);

        if (parsedProfile && parsedProfile.name === "Alex Rivera") {
            localStorage.removeItem(STORAGE.profile);
        }
    }
} catch (error) {
    localStorage.removeItem(STORAGE.profile);
}
    
    function readJson(key, fallback) {
        try {
            var raw = localStorage.getItem(key);

            if (!raw) {
                return fallback;
            }

            return JSON.parse(raw);
        } catch (error) {
            return fallback;
        }
    }

    function writeJson(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error("HealthBridge storage error:", error);
        }
    }

    function todayKey() {
        return new Date().toDateString();
    }

    function formatTime(time) {
        if (!time) {
            return "";
        }

        var parts = time.split(":");
        var hours = parseInt(parts[0], 10);
        var minutes = parts[1] || "00";

        var suffix = hours >= 12 ? "PM" : "AM";
        var display = hours % 12;

        if (display === 0) {
            display = 12;
        }

        return display + ":" + minutes + " " + suffix;
    }

    function getMedicines() {
        return readJson(STORAGE.medicines, []);
    }

    function saveMedicines(list) {
        writeJson(STORAGE.medicines, list);
    }

    function seedDemoMedicines() {
        if (localStorage.getItem(STORAGE.demoSeeded) === "1") {
            return;
        }

        if (getMedicines().length > 0) {
            localStorage.setItem(STORAGE.demoSeeded, "1");
            return;
        }

        var demo = [
            {
                id: 1001,
                name: "Morning Tablet",
                dosage: "1 tablet",
                time: "08:00",
                takenDate: "",
                snoozeUntil: null
            },
            {
                id: 1002,
                name: "Afternoon Tablet",
                dosage: "1 tablet",
                time: "13:00",
                takenDate: "",
                snoozeUntil: null
            },
            {
                id: 1003,
                name: "Night Tablet",
                dosage: "1 tablet",
                time: "21:00",
                takenDate: "",
                snoozeUntil: null
            }
        ];

        saveMedicines(demo);
        localStorage.setItem(STORAGE.demoSeeded, "1");

        addActivity("Demo medication reminders were added for this prototype.");
    }

    function getMedicineStatus(medicine) {
        if (!medicine) {
            return "upcoming";
        }

        if (medicine.takenDate === todayKey()) {
            return "taken";
        }

        var now = new Date();

        var parts = String(medicine.time || "00:00").split(":");

        var due = new Date();

        due.setHours(
            parseInt(parts[0], 10) || 0,
            parseInt(parts[1], 10) || 0,
            0,
            0
        );

        if (medicine.snoozeUntil) {
            var snooze = new Date(medicine.snoozeUntil);

            if (snooze > now) {
                return "upcoming";
            }
        }

        if (now >= due) {
            return "due";
        }

        return "upcoming";
    }

    function statusLabel(status) {
        if (status === "taken") {
            return {
                text: "Taken",
                icon: "✅",
                className: "status-taken"
            };
        }

        if (status === "due") {
            return {
                text: "Due now",
                icon: "🔔",
                className: "status-due"
            };
        }

        return {
            text: "Upcoming",
            icon: "⏳",
            className: "status-upcoming"
        };
    }

    /*
     * Get patient profile.
     *
     * If no profile has been saved:
     * name = ""
     *
     * The UI can then display "Patient" as a placeholder.
     */
    function getProfile() {
        var saved = readJson(STORAGE.profile, null);

        if (!saved) {
            return Object.assign({}, DEFAULT_PROFILE);
        }

        return Object.assign({}, DEFAULT_PROFILE, saved);
    }

    function saveProfile(profile) {
        writeJson(STORAGE.profile, profile);

        /*
         * Immediately update the patient's name anywhere
         * on the current page.
         */
        var name = profile && profile.name
            ? String(profile.name).trim()
            : "";

        var nameEls = document.querySelectorAll("[data-user-name]");

        nameEls.forEach(function (el) {
            el.textContent = name || "Patient";
        });

        window.dispatchEvent(new CustomEvent("hb:profile-updated"));
    }

    function getActivity() {
        return readJson(STORAGE.activity, []);
    }

    function addActivity(text) {
        var items = getActivity();

        items.unshift({
            id: Date.now(),
            text: text,
            time: new Date().toLocaleString()
        });

        writeJson(STORAGE.activity, items.slice(0, 20));
    }

    function getDocuments() {
        return readJson(STORAGE.documents, []);
    }

    function saveDocuments(list) {
        writeJson(STORAGE.documents, list);
    }

    function notificationsEnabled() {
        return localStorage.getItem(STORAGE.notifications) !== "off";
    }

    function medNotifyEnabled() {
        var value = localStorage.getItem(STORAGE.medNotifications);

        return value !== "off" && notificationsEnabled();
    }

    function currentPage() {
        var path = window.location.pathname.split("/").pop() || "index.html";

        return path;
    }

    function toggleSidebar() {
        document.body.classList.toggle("sidebar-open");
    }

    function closeSidebar() {
        document.body.classList.remove("sidebar-open");
    }

    function bindShell() {
        var toggle = document.getElementById("sidebarToggle");
        var backdrop = document.getElementById("sidebarBackdrop");
        var closeBtn = document.getElementById("sidebarClose");

        if (toggle) {
            toggle.addEventListener("click", toggleSidebar);
        }

        if (backdrop) {
            backdrop.addEventListener("click", closeSidebar);
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", closeSidebar);
        }

        var page = currentPage();

        var links = document.querySelectorAll(".nav-link[data-page]");

        links.forEach(function (link) {
            if (link.getAttribute("data-page") === page) {
                link.classList.add("active");
            }
        });

        /*
         * Show saved patient name.
         * If no name exists, show "Patient".
         */
        var profile = getProfile();

        var patientName = profile.name
            ? String(profile.name).trim()
            : "";

        var nameEls = document.querySelectorAll("[data-user-name]");

        nameEls.forEach(function (el) {
            el.textContent = patientName || "Patient";
        });

        var bell = document.getElementById("notificationBell");
        var panel = document.getElementById("notificationPanel");

        if (bell && panel) {
            bell.addEventListener("click", function (event) {
                event.stopPropagation();

                panel.classList.toggle("is-open");

                renderNotifications();
            });

            document.addEventListener("click", function () {
                panel.classList.remove("is-open");
            });

            panel.addEventListener("click", function (event) {
                event.stopPropagation();
            });
        }

        renderNotifications();
    }

    function renderNotifications() {
        var list = document.getElementById("notificationList");
        var badge = document.getElementById("notificationBadge");

        if (!list) {
            return;
        }

        var medicines = getMedicines();

        var due = medicines.filter(function (med) {
            return getMedicineStatus(med) === "due";
        });

        var items = [];

        due.forEach(function (med) {
            items.push(
                "💊 " +
                med.name +
                " is due (" +
                formatTime(med.time) +
                ")"
            );
        });

        var activity = getActivity().slice(0, 3);

        activity.forEach(function (item) {
            items.push(item.text);
        });

        if (items.length === 0) {
            list.innerHTML =
                "<p class='empty-note'>No notifications right now.</p>";
        } else {
            list.innerHTML = items.map(function (text) {
                return (
                    "<div class='notice-item'>" +
                    escapeHtml(text) +
                    "</div>"
                );
            }).join("");
        }

        if (badge) {
            badge.textContent = String(due.length);
            badge.hidden = due.length === 0;
        }
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function showToast(message, type) {
        var existing = document.getElementById("appToast");

        if (existing) {
            existing.remove();
        }

        var toast = document.createElement("div");

        toast.id = "appToast";
        toast.className = "app-toast " + (type || "success");
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(function () {
            toast.classList.add("is-visible");
        }, 10);

        setTimeout(function () {
            toast.classList.remove("is-visible");

            setTimeout(function () {
                toast.remove();
            }, 250);
        }, 2600);
    }

    var reminderTimer = null;

    function checkMedicationTime() {
        if (!medNotifyEnabled()) {
            return;
        }

        var now = new Date();

        var currentTime =
            String(now.getHours()).padStart(2, "0") +
            ":" +
            String(now.getMinutes()).padStart(2, "0");

        var medicines = getMedicines();

        medicines.forEach(function (medicine) {
            var matchTime = medicine.time === currentTime;

            var snoozeHit =
                medicine.snoozeUntil &&
                new Date(medicine.snoozeUntil) <= now &&
                getMedicineStatus(medicine) === "due";

            if (!matchTime && !snoozeHit) {
                return;
            }

            if (medicine.takenDate === todayKey()) {
                return;
            }

            var alarmKey = medicine.id + "-" + currentTime;

            if (sessionStorage.getItem(alarmKey)) {
                return;
            }

            sessionStorage.setItem(alarmKey, "shown");

            showMedicationReminder(medicine);
        });
    }

    function showMedicationReminder(medicine) {
        var oldReminder =
            document.getElementById("medicationReminder");

        if (oldReminder) {
            oldReminder.remove();
        }

        var reminder = document.createElement("div");

        reminder.id = "medicationReminder";

        reminder.innerHTML =
            '<div class="reminder-box" role="dialog" aria-labelledby="reminderTitle">' +
                '<div class="reminder-icon">🔔</div>' +
                "<h2 id='reminderTitle'>Medication Reminder</h2>" +
                "<p>💊 <strong>" +
                    escapeHtml(medicine.name) +
                "</strong></p>" +
                "<p>📋 " +
                    escapeHtml(medicine.dosage) +
                "</p>" +
                "<p>⏰ It is time for your scheduled medication.</p>" +
                "<p class='reminder-note'>" +
                    "This alert only appears while this browser tab is open." +
                "</p>" +
                '<div class="reminder-buttons">' +
                    '<button type="button" class="btn btn-primary" data-taken="' +
                        medicine.id +
                    '">✅ Taken</button>' +
                    '<button type="button" class="btn btn-ghost" data-snooze="' +
                        medicine.id +
                    '">⏰ Snooze 5 min</button>' +
                "</div>" +
            "</div>";

        document.body.appendChild(reminder);

        reminder
            .querySelector("[data-taken]")
            .addEventListener("click", function () {
                markAsTaken(medicine.id);
            });

        reminder
            .querySelector("[data-snooze]")
            .addEventListener("click", function () {
                snoozeReminder(medicine.id);
            });
    }

    function markAsTaken(id) {
        var medicines = getMedicines().map(function (med) {
            if (med.id === id) {
                med.takenDate = todayKey();
                med.snoozeUntil = null;
            }

            return med;
        });

        saveMedicines(medicines);

        var reminder =
            document.getElementById("medicationReminder");

        if (reminder) {
            reminder.remove();
        }

        addActivity("Medication marked as taken");

        showToast("Marked as taken", "success");

        window.dispatchEvent(
            new CustomEvent("hb:medicines-updated")
        );

        renderNotifications();
    }

    function snoozeReminder(id) {
        var until =
            new Date(
                Date.now() + 5 * 60 * 1000
            ).toISOString();

        var medicines = getMedicines().map(function (med) {
            if (med.id === id) {
                med.snoozeUntil = until;
            }

            return med;
        });

        saveMedicines(medicines);

        var reminder =
            document.getElementById("medicationReminder");

        if (reminder) {
            reminder.remove();
        }

        showToast("Snoozed for 5 minutes", "success");

        window.dispatchEvent(
            new CustomEvent("hb:medicines-updated")
        );

        setTimeout(function () {
            var list = getMedicines();

            var found = list.filter(function (med) {
                return med.id === id;
            })[0];

            if (
                found &&
                found.takenDate !== todayKey()
            ) {
                showMedicationReminder(found);
            }
        }, 5 * 60 * 1000);
    }

    function startReminderLoop() {
        if (reminderTimer) {
            return;
        }

        checkMedicationTime();

        reminderTimer = setInterval(
            checkMedicationTime,
            10000
        );
    }

    window.HealthBridge = {
        STORAGE: STORAGE,

        readJson: readJson,
        writeJson: writeJson,

        getMedicines: getMedicines,
        saveMedicines: saveMedicines,

        getMedicineStatus: getMedicineStatus,
        statusLabel: statusLabel,
        formatTime: formatTime,

        getProfile: getProfile,
        saveProfile: saveProfile,

        getActivity: getActivity,
        addActivity: addActivity,

        getDocuments: getDocuments,
        saveDocuments: saveDocuments,

        escapeHtml: escapeHtml,
        showToast: showToast,

        markAsTaken: markAsTaken,
        snoozeReminder: snoozeReminder,
        showMedicationReminder: showMedicationReminder,

        seedDemoMedicines: seedDemoMedicines,

        todayKey: todayKey
    };

    /*
     * Compatibility function.
     */
    window.markAsTaken = function () {
        var reminder =
            document.getElementById("medicationReminder");

        if (reminder) {
            reminder.remove();
        }
    };

    function initializeApp() {
        seedDemoMedicines();
        bindShell();
        startReminderLoop();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeApp
        );
    } else {
        initializeApp();
    }

})();
```
