const questions = document.querySelectorAll("form > div[class^='q']");
const numOfq = document.querySelectorAll(".num-of-q > div")
const numOfqdiv = document.querySelector(".num-of-q")
const info = document.querySelector(".answerd")
const reward  = document.querySelector(".reward")
let answers = []

let currentStep = localStorage.getItem("currentStep") ? localStorage.getItem("currentStep") : 0;


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

infoBtn.addEventListener("click", (e) => {
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

    let user = [name.value, number.value.trim()];
    localStorage.setItem("userData", JSON.stringify(user));

    info.classList.add("d-none");
    reward.classList.remove("d-none");
    localStorage.setItem("currentStep", "reward");
});
