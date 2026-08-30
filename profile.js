(function () {
    "use strict";
    var HB = window.HealthBridge;

    function fillForm() {
        var profile = HB.getProfile();
        var map = {
            profileName: profile.name,
            profileAge: profile.age,
            profileGender: profile.gender,
            profileBlood: profile.bloodGroup,
            profilePhone: profile.phone,
            profileEmail: profile.email,
            profileEmergency: profile.emergency,
            profileNotes: profile.notes
        };
        Object.keys(map).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) {
                el.value = map[id] || "";
            }
        });
        var display = document.getElementById("profileDisplayName");
        if (display) {
            display.textContent = profile.name;
        }
        var medCount = document.getElementById("profileMedCount");
        var docCount = document.getElementById("profileDocCount");
        if (medCount) {
            medCount.textContent = String(HB.getMedicines().length);
        }
        if (docCount) {
            docCount.textContent = String(HB.getDocuments().length);
        }
    }

    function saveProfile(event) {
        event.preventDefault();
        var profile = {
            name: document.getElementById("profileName").value.trim() || "Patient",
            age: document.getElementById("profileAge").value.trim(),
            gender: document.getElementById("profileGender").value.trim(),
            bloodGroup: document.getElementById("profileBlood").value.trim(),
            phone: document.getElementById("profilePhone").value.trim(),
            email: document.getElementById("profileEmail").value.trim(),
            emergency: document.getElementById("profileEmergency").value.trim(),
            notes: document.getElementById("profileNotes").value.trim()
        };
        HB.saveProfile(profile);
        HB.addActivity("Profile updated");
        fillForm();
        document.querySelectorAll("[data-user-name]").forEach(function (el) {
            el.textContent = profile.name;
        });
        HB.showToast("Profile saved in this browser");
    }

    window.editProfile = function () {
        document.getElementById("profileName").focus();
    };

    document.addEventListener("DOMContentLoaded", function () {
        fillForm();
        var form = document.getElementById("profileForm");
        if (form) {
            form.addEventListener("submit", saveProfile);
        }
    });
})();
