(function () {
    "use strict";

    var terms = {
        hypertension: {
            english: "Hypertension means high blood pressure. The pressure of blood against vessel walls is higher than the usual range.",
            tamil: "உயர் இரத்த அழுத்தம் என்பது இரத்தம் இரத்தக் குழாய்களின் சுவர்களில் செலுத்தும் அழுத்தம் இயல்பை விட அதிகமாக இருக்கும் நிலையாகும்."
        },
        diabetes: {
            english: "Diabetes is a condition in which blood glucose levels are too high because the body does not make enough insulin or does not use insulin properly.",
            tamil: "நீரிழிவு நோய் என்பது இரத்தத்தில் சர்க்கரையின் அளவு அதிகமாக இருக்கும் ஒரு நிலையாகும்."
        },
        anemia: {
            english: "Anemia means the blood does not have enough healthy red blood cells or hemoglobin to carry oxygen effectively.",
            tamil: "இரத்த சோகை என்பது உடலுக்கு தேவையான ஆக்சிஜனை எடுத்துச் செல்ல போதுமான ஆரோக்கியமான சிவப்பு இரத்த அணுக்கள் இல்லாத நிலையாகும்."
        },
        asthma: {
            english: "Asthma can make breathing difficult because the airways can become inflamed and narrowed.",
            tamil: "ஆஸ்துமா என்பது மூச்சுக்குழாய்களில் வீக்கம் அல்லது குறுகல் ஏற்படுவதால் சுவாசிப்பதில் சிரமம் ஏற்படக்கூடிய ஒரு நிலையாகும்."
        },
        migraine: {
            english: "A migraine is a type of headache that can cause strong or throbbing pain and may occur with nausea or light sensitivity.",
            tamil: "மைக்ரேன் என்பது கடுமையான அல்லது துடிப்பான தலைவலியை ஏற்படுத்தக்கூடிய ஒரு வகையான தலைவலியாகும்."
        },
        fever: {
            english: "A fever means the body's temperature is higher than its usual range. It can happen when the body is responding to an infection or another condition.",
            tamil: "காய்ச்சல் என்பது உடலின் வெப்பநிலை இயல்பான அளவை விட அதிகமாக இருக்கும் நிலையாகும்."
        },
        cholesterol: {
            english: "Cholesterol is a waxy substance found in the blood and cells. The body needs some cholesterol, but too much of certain types can increase health risks.",
            tamil: "கொலஸ்ட்ரால் என்பது இரத்தத்திலும் உடலின் செல்களிலும் காணப்படும் மெழுகு போன்ற ஒரு பொருளாகும்."
        },
        infection: {
            english: "An infection happens when harmful microorganisms such as bacteria, viruses, fungi, or parasites enter and multiply in the body.",
            tamil: "தொற்று என்பது தீங்கு விளைவிக்கும் நுண்ணுயிரிகள் உடலுக்குள் நுழைந்து பெருகும்போது ஏற்படும் நிலையாகும்."
        },
        inflammation: {
            english: "Inflammation is the body's natural response to injury, irritation, or infection. It can cause swelling, redness, warmth, or pain.",
            tamil: "அழற்சி என்பது காயம், எரிச்சல் அல்லது தொற்றுக்கு உடலின் இயற்கையான பதிலாகும்."
        }
    };

    function explainTerm() {
        var term = document.getElementById("medicalTerm").value.trim().toLowerCase();
        var box = document.getElementById("explanation");
        if (!term) {
            box.innerHTML = "<div class='empty-state'>Please enter a medical term.</div>";
            return;
        }
        var language = localStorage.getItem("healthBridgeLanguage") || "english";
        var data = terms[term];
        if (!data) {
            box.innerHTML = "<div class='card'><h3>Term not in this demo list</h3><p>Try hypertension, diabetes, anemia, asthma, migraine, fever, cholesterol, infection, or inflammation.</p></div>";
            return;
        }
        var text = language === "tamil" ? data.tamil : data.english;
        var title = term.charAt(0).toUpperCase() + term.slice(1);
        box.innerHTML =
            "<div class='card'><h3>" + title + "</h3><p>" + text +
            "</p><p class='muted'>This explanation is for general understanding only and does not replace advice from a qualified healthcare professional.</p></div>";
    }

    window.explainTerm = explainTerm;

    document.addEventListener("DOMContentLoaded", function () {
        var form = document.getElementById("termForm");
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                explainTerm();
            });
        }
    });
})();
