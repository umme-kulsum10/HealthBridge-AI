```javascript
(function () {
    "use strict";

    function applyFontSize(size) {
        document.body.classList.remove(
            "font-small",
            "font-medium",
            "font-large"
        );

        if (size === "small") {
            document.body.classList.add("font-small");
        } else if (size === "large") {
            document.body.classList.add("font-large");
        } else {
            document.body.classList.add("font-medium");
        }
    }

    function applyTheme(theme) {
        var isDark = theme === "dark";

        document.body.classList.toggle("dark-theme", isDark);

        document.documentElement.setAttribute(
            "data-theme",
            isDark ? "dark" : "light"
        );
    }

    function applyContrast(contrast) {
        document.body.classList.toggle(
            "high-contrast",
            contrast === "on"
        );
    }

    function applyReducedMotion(value) {
        document.body.classList.toggle(
            "reduce-motion",
            value === "on"
        );
    }

    function applySavedSettings() {
        var theme =
            localStorage.getItem("healthBridgeTheme") || "light";

        var fontSize =
            localStorage.getItem("healthBridgeFontSize") || "medium";

        var contrast =
            localStorage.getItem("healthBridgeContrast") || "off";

        var reducedMotion =
            localStorage.getItem("healthBridgeReducedMotion") || "off";

        applyTheme(theme);
        applyFontSize(fontSize);
        applyContrast(contrast);
        applyReducedMotion(reducedMotion);
    }

    window.HealthBridgeSettings = {
        applyFontSize: applyFontSize,
        applyTheme: applyTheme,
        applyContrast: applyContrast,
        applyReducedMotion: applyReducedMotion,
        applySavedSettings: applySavedSettings
    };

    window.applyFontSize = applyFontSize;
    window.applyTheme = applyTheme;
    window.applyContrast = applyContrast;

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            applySavedSettings
        );
    } else {
        applySavedSettings();
    }

})();
```
