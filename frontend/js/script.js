const questions = document.querySelectorAll("form > div[class^='q']");
const numOfq = document.querySelectorAll(".num-of-q > div")
const numOfqdiv = document.querySelector(".num-of-q")
const info = document.querySelector(".answerd")
const reward  = document.querySelector(".reward")
let answers = []

let currentStep = localStorage.getItem("currentStep") ? localStorage.getItem("currentStep") : 0;

// --- Integration: detect referral code from URL (?ref=CODE) and persist ---
// We store it so we can include it when submitting to the backend
const urlParams = new URLSearchParams(window.location.search);
const referralFromUrl = urlParams.get("ref");
if (referralFromUrl) {
    localStorage.setItem("refCode", referralFromUrl);
    
    // Show referral indicator
    const referralIndicator = document.getElementById("referral-indicator");
    const referralCodeDisplay = document.getElementById("referral-code-display");
    if (referralIndicator && referralCodeDisplay) {
        referralCodeDisplay.textContent = `رمز الدعوة: ${referralFromUrl}`;
        referralIndicator.classList.remove("d-none");
        referralIndicator.style.display = "block";
    }
}

if (currentStep === "info") {
    numOfqdiv.classList.add("d-none");
    questions[0].style.display = "none";
    info.classList.remove("d-none");
} else if (currentStep === "reward") {
    numOfqdiv.classList.add("d-none");
    info.classList.add("d-none");
    questions[0].style.display = "none";
    reward.classList.remove("d-none");
} else {
    questions[0].style.display = "block";
    numOfq[0].classList.add("p-active");
}


questions.forEach((q,index)=>{
    const buttons = q.querySelectorAll(".btn")

    buttons.forEach(btn => {
        btn.addEventListener("click" , function(e){
            e.preventDefault()

            const answer = btn.getAttribute("answer")
            answers[index] = answer

            numOfq[index].classList.remove("p-active")
            q.classList.add("d-none")

            if (index + 1 < questions.length){
                numOfq[index+1].classList.add("p-active")
                questions[index+1].style.display = "block"
            }else{
                localStorage.setItem("surveyAnswers", JSON.stringify(answers));
                numOfqdiv.classList.add("d-none")
                questions.forEach(q => q.style.display = "none")
                info.classList.remove("d-none")
                localStorage.setItem("currentStep", "info");
            }
        })
    })
})


// //////////////////////////////////////////////////////

const Whats = document.querySelector("header .btn")
Whats.addEventListener("click", function () {
    window.open("https://wa.me/9647700095529", "_blank");
});

// ///////////////////////////////////////////////////////////


const name = document.querySelector("#name")
const number = document.querySelector("#number")
const infoBtn = document.querySelector("#info-btn")
const nameM = document.querySelector(".invalid-name")
const numberM = document.querySelector(".invalid-number")

// Elements inside reward step
const copyBtn = document.querySelector("#copylink");
const rewardMessage = document.querySelector(".reward h4");
const progressText = document.querySelector("#progress-text");
const progressBar = document.querySelector("#progress-bar");

// --- Integration config: Backend base URL ---
// Default to backend on localhost:3000. Override by setting window.BACKEND_ORIGIN = "https://your-backend" before loading this script.
const API_BASE_RAW = (typeof window !== "undefined" && window.BACKEND_ORIGIN) || "http://localhost:3000";
// Normalize to avoid trailing slash (which would cause //api and a redirect on preflight)
// const API_BASE = API_BASE_RAW.replace(/\/+$/, "");
const API_BASE = "";

// --- Integration: function to refresh referral progress ---
async function refreshProgress(referralCode) {
    try {
        const resp = await fetch(`${API_BASE}/api/survey/ref/${encodeURIComponent(referralCode)}/stats`);
        if (!resp.ok) return;
        const stats = await resp.json();
        const target = stats.rewardTarget || 5;
        const count = stats.referralsCount || 0;
        
        // Update text like "3 / 5 (60%)"
        if (progressText) {
            const percentage = Math.round((count / target) * 100);
            progressText.textContent = `${count} / ${target} (${percentage}%)`;
        }
        
        // Update bar width percentage
        const pct = Math.max(0, Math.min(100, Math.round((count / target) * 100)));
        if (progressBar) {
            progressBar.style.width = pct + "%";
            progressBar.setAttribute("aria-valuenow", String(pct));
        }
    } catch (e) {
        // Non-fatal
        console.warn("Failed to refresh progress", e);
    }
}

let progressIntervalId = null;

infoBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (name.value.trim() === "" && number.value.trim() === "") {
        nameM.classList.add("d-block")
        numberM.classList.add("d-block")
        return; 
    }

    if (name.value.trim() === "" ) {
        nameM.classList.add("d-block")
        numberM.classList.remove("d-block")
        return;
    }
    if (number.value.trim() === "" ) {
        numberM.classList.add("d-block")
        nameM.classList.remove("d-block")
        return;
    } 

    // Persist minimal user data locally (kept from original behavior)
    let user = [name.value, number.value.trim()];
    localStorage.setItem("userData", JSON.stringify(user));

    // --- Integration: Submit survey to backend ---
    // Prepare payload expected by backend controller
    const storedAnswers = JSON.parse(localStorage.getItem("surveyAnswers") || "[]");
    const refCode = localStorage.getItem("refCode") || null;

    const payload = {
        phone: number.value.trim(),
        // We send an object for answers. Map array indices to keys Q1..Qn
        answers: storedAnswers.reduce((obj, ans, idx) => {
            obj[`Q${idx+1}`] = ans;
            return obj;
        }, {}),
        ref: refCode || undefined
    };

    try {
        const resp = await fetch(`${API_BASE}/api/survey/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            // Handle validation/duplicate errors gracefully
            const err = await resp.json().catch(() => ({ error: "Unknown error" }));
            alert(err.error || "حدث خطأ أثناء الإرسال. حاول مرة أخرى.");
            return;
        }

        const data = await resp.json();
        // data.shareLink and data.referralCode come from backend

        // Persist my referral code so we can resume progress after reload
        if (data.referralCode) {
            localStorage.setItem("myReferralCode", JSON.stringify(data.referralCode));
        }

        // --- Integration: Show share link UI and copy button ---
        info.classList.add("d-none");
        reward.classList.remove("d-none");
        localStorage.setItem("currentStep", "reward");

        // Update the message to include the share link (and short instruction)
        rewardMessage.textContent = "تم إرسال الاستبيان بنجاح. انسخ رابط الدعوة وشاركه مع أصدقائك!";

        // Attach copy to clipboard behavior
        copyBtn.onclick = async () => {
            try {
                await navigator.clipboard.writeText(data.shareLink);
                copyBtn.textContent = "تم النسخ!";
                setTimeout(() => (copyBtn.textContent = "اضغط لنسخ الرابط"), 1500);
            } catch (_) {
                // Fallback prompt if clipboard API is blocked
                window.prompt("انسخ الرابط التالي:", data.shareLink);
            }
        };

        // Also set initial button text to make it clear
        copyBtn.textContent = "اضغط لنسخ الرابط";

        // --- Integration: show and update progress bar ---
        // We refresh immediately, then set an interval to keep it live
        if (data.referralCode) {
            await refreshProgress(data.referralCode);
            if (progressIntervalId) clearInterval(progressIntervalId);
            progressIntervalId = setInterval(() => refreshProgress(data.referralCode), 15000); // every 15s
        }

    } catch (e) {
        alert("تعذر الاتصال بالخادم. تأكد من تشغيل الخادم ثم حاول مجددًا.");
        console.error(e);
    }
});

// If user refreshes on reward step, try to resume progress updates using stored code
(async function resumeProgressIfNeeded(){
    try {
        if (localStorage.getItem("currentStep") === "reward") {
            const myDataRaw = localStorage.getItem("myReferralCode");
            if (myDataRaw) {
                const myCode = JSON.parse(myDataRaw);
                if (myCode) {
                    await refreshProgress(myCode);
                    if (progressIntervalId) clearInterval(progressIntervalId);
                    progressIntervalId = setInterval(() => refreshProgress(myCode), 15000);
                }
            }
        }
    } catch (_) {}
})();
