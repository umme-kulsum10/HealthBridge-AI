(function () {
    "use strict";
    var HB = window.HealthBridge;
    var medicines = [];

    function load() {
        medicines = HB.getMedicines();
        displayMedicines();
        renderAside();
    }

    function addMedicine() {
        var name = document.getElementById("medicineName").value.trim();
        var dosage = document.getElementById("dosage").value.trim();
        var time = document.getElementById("medicineTime").value;
        var error = document.getElementById("medError");
        if (name === "" || dosage === "" || time === "") {
            if (error) {
                error.textContent = "Please fill in all medication details.";
            } else {
                alert("Please fill in all medication details.");
            }
            return;
        }
        if (error) {
            error.textContent = "";
        }
        medicines.push({
            id: Date.now(),
            name: name,
            dosage: dosage,
            time: time,
            takenDate: "",
            snoozeUntil: null
        });
        HB.saveMedicines(medicines);
        HB.addActivity("Medication reminder added: " + name);
        document.getElementById("medicineName").value = "";
        document.getElementById("dosage").value = "";
        document.getElementById("medicineTime").value = "";
        displayMedicines();
        renderAside();
        HB.showToast("Medication reminder added");
        window.dispatchEvent(new CustomEvent("hb:medicines-updated"));
    }

    function displayMedicines() {
        var list = document.getElementById("medicineList");
        if (!list) {
            return;
        }
        if (medicines.length === 0) {
            list.innerHTML = "<div class='empty-state'>No medication reminders added yet.</div>";
            return;
        }
        list.innerHTML = medicines.slice().sort(function (a, b) {
            return String(a.time).localeCompare(String(b.time));
        }).map(function (medicine) {
            var status = HB.getMedicineStatus(medicine);
            var meta = HB.statusLabel(status);
            var takenBtn = status === "taken"
                ? ""
                : "<button type='button' class='btn btn-primary' data-take='" + medicine.id + "'>Mark as Taken</button>";
            return (
                "<article class='medicine-card'>" +
                "<div>💊</div>" +
                "<div>" +
                "<strong>" + HB.escapeHtml(medicine.name) + "</strong>" +
                "<div class='muted'>📋 " + HB.escapeHtml(medicine.dosage) + "</div>" +
                "<div class='muted'>⏰ " + HB.formatTime(medicine.time) + "</div>" +
                "</div>" +
                "<div>" +
                "<span class='status-pill " + meta.className + "'>" + meta.icon + " " + meta.text + "</span>" +
                "<div class='medicine-actions' style='margin-top:8px'>" +
                takenBtn +
                "<button type='button' class='btn btn-danger' data-delete='" + medicine.id + "'>Delete</button>" +
                "</div></div></article>"
            );
        }).join("");

        list.querySelectorAll("[data-delete]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                deleteMedicine(Number(btn.getAttribute("data-delete")));
            });
        });
        list.querySelectorAll("[data-take]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                HB.markAsTaken(Number(btn.getAttribute("data-take")));
                load();
            });
        });
    }

    function renderAside() {
        var upcoming = document.getElementById("upcomingList");
        var dueBox = document.getElementById("dueNowBox");
        if (!upcoming) {
            return;
        }
        var due = [];
        var later = [];
        medicines.forEach(function (med) {
            var status = HB.getMedicineStatus(med);
            if (status === "due") {
                due.push(med);
            } else if (status === "upcoming") {
                later.push(med);
            }
        });
        upcoming.innerHTML = later.length
            ? later.map(function (med) {
                return "<div class='med-row'><div>⏳</div><div><strong>" + HB.escapeHtml(med.name) + "</strong><div class='muted'>" + HB.formatTime(med.time) + "</div></div></div>";
            }).join("")
            : "<p class='muted'>No upcoming reminders.</p>";
        if (dueBox) {
            dueBox.innerHTML = due.length
                ? due.map(function (med) {
                    return "<div class='med-row'><div>🔔</div><div><strong>" + HB.escapeHtml(med.name) + "</strong><div class='muted'>Due now</div></div></div>";
                }).join("")
                : "<p class='muted'>Nothing is due right now.</p>";
        }
    }

    function deleteMedicine(id) {
        if (!confirm("Delete this medication reminder?")) {
            return;
        }
        medicines = medicines.filter(function (medicine) {
            return medicine.id !== id;
        });
        HB.saveMedicines(medicines);
        HB.addActivity("Medication reminder deleted");
        displayMedicines();
        renderAside();
        HB.showToast("Medication deleted");
        window.dispatchEvent(new CustomEvent("hb:medicines-updated"));
    }

    window.addMedicine = addMedicine;
    window.deleteMedicine = deleteMedicine;
    window.displayMedicines = displayMedicines;
    window.checkMedicationTime = function () {};
    window.showMedicationReminder = HB.showMedicationReminder;
    window.snoozeReminder = function (name, dosage) {
        var found = medicines.filter(function (m) {
            return m.name === name && m.dosage === dosage;
        })[0];
        if (found) {
            HB.snoozeReminder(found.id);
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        load();
        var form = document.getElementById("addMedForm");
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                addMedicine();
            });
        }
        var fab = document.getElementById("addMedFab");
        if (fab) {
            fab.addEventListener("click", function () {
                document.getElementById("medicineName").focus();
            });
        }
    });

    window.addEventListener("hb:medicines-updated", load);
})();
