(function () {
    "use strict";
    var HB = window.HealthBridge;
    var MAX_BYTES = 700000;

    function fileKind(file) {
        var type = file.type || "";
        if (type.indexOf("pdf") !== -1) {
            return "PDF";
        }
        if (type.indexOf("image") !== -1) {
            return "Image";
        }
        if (type.indexOf("text") !== -1) {
            return "Text";
        }
        return "File";
    }

    function renderDocs() {
        var grid = document.getElementById("documentGrid");
        if (!grid) {
            return;
        }
        var docs = HB.getDocuments();
        if (docs.length === 0) {
            grid.innerHTML = "<div class='empty-state'>No documents yet. Files are stored in this browser only — not on a medical server.</div>";
            return;
        }
        grid.innerHTML = docs.map(function (doc) {
            return (
                "<article class='doc-card'>" +
                "<div>📄</div>" +
                "<strong>" + HB.escapeHtml(doc.name) + "</strong>" +
                "<div class='muted'>" + HB.escapeHtml(doc.kind) + "</div>" +
                "<div class='muted'>" + HB.escapeHtml(doc.date) + "</div>" +
                "<div class='btn-row'>" +
                "<button type='button' class='btn btn-ghost' data-view='" + doc.id + "'>View</button>" +
                "<button type='button' class='btn btn-danger' data-del='" + doc.id + "'>Delete</button>" +
                "</div></article>"
            );
        }).join("");
        grid.querySelectorAll("[data-view]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                viewDoc(btn.getAttribute("data-view"));
            });
        });
        grid.querySelectorAll("[data-del]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                deleteDoc(btn.getAttribute("data-del"));
            });
        });
    }

    function viewDoc(id) {
        var doc = HB.getDocuments().filter(function (item) {
            return String(item.id) === String(id);
        })[0];
        if (!doc || !doc.dataUrl) {
            HB.showToast("This file cannot be previewed", "error");
            return;
        }
        window.open(doc.dataUrl, "_blank");
    }

    function deleteDoc(id) {
        if (!confirm("Delete this document from browser storage?")) {
            return;
        }
        var docs = HB.getDocuments().filter(function (item) {
            return String(item.id) !== String(id);
        });
        HB.saveDocuments(docs);
        HB.addActivity("Document deleted");
        renderDocs();
        HB.showToast("Document deleted");
    }

    function uploadDocument() {
        var input = document.getElementById("documentFile");
        var file = input.files && input.files[0];
        var result = document.getElementById("fileResult");
        if (!file) {
            if (result) {
                result.textContent = "Please select a document first.";
            }
            return;
        }
        if (file.size > MAX_BYTES) {
            HB.showToast("Please choose a smaller demo file (under ~700KB)", "error");
            return;
        }
        var reader = new FileReader();
        reader.onload = function () {
            var docs = HB.getDocuments();
            docs.unshift({
                id: Date.now(),
                name: file.name,
                kind: fileKind(file),
                type: file.type,
                date: new Date().toLocaleString(),
                dataUrl: reader.result
            });
            try {
                HB.saveDocuments(docs);
            } catch (error) {
                HB.showToast("Browser storage is full. Delete a document and try again.", "error");
                return;
            }
            HB.addActivity("Document uploaded: " + file.name);
            input.value = "";
            renderDocs();
            if (result) {
                result.textContent = "Saved locally in this browser: " + file.name;
            }
            HB.showToast("Document saved in this browser");
        };
        reader.readAsDataURL(file);
    }

    window.uploadDocument = uploadDocument;

    document.addEventListener("DOMContentLoaded", function () {
        renderDocs();
        var form = document.getElementById("uploadForm");
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                uploadDocument();
            });
        }
    });
})();
