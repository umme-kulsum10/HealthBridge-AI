(function () {
    "use strict";
    var HB = window.HealthBridge;

    function renderDashboard() {
        var list = document.getElementById("todayMeds");
        var adherence = document.getElementById("statAdherence");
        var upcoming = document.getElementById("statUpcoming");
        var docs = document.getElementById("statDocs");
        var comm = document.getElementById("statComm");
        var activity = document.getElementById("activityList");
        var welcomeName = document.getElementById("welcomeName");
        if (!list) {
            return;
        }

        var profile = HB.getProfile();
        if (welcomeName) {
            welcomeName.textContent = profile.name;
        }

        var medicines = HB.getMedicines().slice().sort(function (a, b) {
            return String(a.time).localeCompare(String(b.time));
        });
        var taken = 0;
        var dueOrUpcoming = 0;
        if (medicines.length === 0) {
            list.innerHTML = "<div class='empty-state'>No medication reminders yet. Add one from the Medication page.</div>";
        } else {
            list.innerHTML = medicines.map(function (med) {
                var status = HB.getMedicineStatus(med);
                if (status === "taken") {
                    taken += 1;
                } else {
                    dueOrUpcoming += 1;
                }
                var meta = HB.statusLabel(status);
                return (
                    "<div class='med-row'>" +
                    "<div>💊</div>" +
                    "<div><strong>" + HB.escapeHtml(med.name) + "</strong>" +
                    "<div class='muted'>" + HB.escapeHtml(med.dosage) + " · " + HB.formatTime(med.time) + "</div></div>" +
                    "<span class='status-pill " + meta.className + "'>" + meta.icon + " " + meta.text + "</span>" +
                    "</div>"
                );
            }).join("");
        }

        if (adherence) {
            var percent = medicines.length ? Math.round((taken / medicines.length) * 100) : 0;
            adherence.textContent = percent + "%";
        }
        if (upcoming) {
            upcoming.textContent = String(dueOrUpcoming);
        }
        if (docs) {
            docs.textContent = String(HB.getDocuments().length);
        }
        if (comm) {
            var chat = HB.readJson(HB.STORAGE.chat, []);
            comm.textContent = chat.length ? "Active" : "Idle";
        }
        if (activity) {
            var items = HB.getActivity();
            if (items.length === 0) {
                activity.innerHTML = "<div class='empty-state'>No recent activity yet.</div>";
            } else {
                activity.innerHTML = items.slice(0, 6).map(function (item) {
                    return "<div class='activity-item'><strong>" + HB.escapeHtml(item.text) + "</strong><div class='muted'>" + HB.escapeHtml(item.time) + "</div></div>";
                }).join("");
            }
        }
    }

    document.addEventListener("DOMContentLoaded", renderDashboard);
    window.addEventListener("hb:medicines-updated", renderDashboard);
})();
