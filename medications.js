const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
    res.json({ ok: true, service: "medications" });
});

module.exports = router;
