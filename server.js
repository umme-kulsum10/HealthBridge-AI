const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const dataFile = path.join(__dirname, "data", "medications.json");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "..")));

function readMedications() {
    try {
        return JSON.parse(fs.readFileSync(dataFile, "utf8"));
    } catch (error) {
        return [];
    }
}

function writeMedications(list) {
    fs.writeFileSync(dataFile, JSON.stringify(list, null, 2));
}

app.get("/api/medications", function (req, res) {
    res.json(readMedications());
});

app.post("/api/medications", function (req, res) {
    const list = readMedications();
    const item = {
        id: Date.now(),
        name: req.body.name || "Untitled",
        dosage: req.body.dosage || "",
        time: req.body.time || "08:00",
        takenDate: "",
        snoozeUntil: null
    };
    list.push(item);
    writeMedications(list);
    res.status(201).json(item);
});

app.put("/api/medications/:id", function (req, res) {
    const id = Number(req.params.id);
    const list = readMedications();
    const index = list.findIndex(function (item) {
        return item.id === id;
    });
    if (index === -1) {
        return res.status(404).json({ error: "Not found" });
    }
    list[index] = Object.assign({}, list[index], req.body, { id: id });
    writeMedications(list);
    res.json(list[index]);
});

app.delete("/api/medications/:id", function (req, res) {
    const id = Number(req.params.id);
    const next = readMedications().filter(function (item) {
        return item.id !== id;
    });
    writeMedications(next);
    res.json({ ok: true });
});

app.post("/api/ai/chat", function (req, res) {
    const message = String((req.body && req.body.message) || "").toLowerCase();
    let reply =
        "I can help explain healthcare information in simple language. I cannot diagnose, prescribe, or replace a qualified professional.";
    if (/hello|hi\b/.test(message)) {
        reply = "Hello. Ask about medication schedules, documents, or what to discuss with a clinician.";
    } else if (/medication|schedule/.test(message)) {
        reply = "Use the Medication page for times you entered. I cannot change a prescribed dose.";
    } else if (/emergency|chest pain|can't breathe/.test(message)) {
        reply = "If this could be an emergency, seek urgent medical care now. This API is a demo only.";
    }
    res.json({
        reply: reply,
        source: "demo-server",
        disclaimer: "Prototype response. Not medical advice."
    });
});

app.listen(PORT, function () {
    console.log("HealthBridge AI demo server at http://localhost:" + PORT);
});
