let data;
let quizIndex = 0;
let score = 0;

// JSON laden
fetch("data.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    initQuiz();
  });

// Navigation
function showSection(id) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// QUIZ
function initQuiz() {
  loadQuestion();
}

function loadQuestion() {
  const q = data.quiz[quizIndex];
  const container = document.getElementById("quiz-container");

  if (!q) {
    container.innerHTML = `<h3>🎉 Quiz beendet!</h3><p>${score}/${data.quiz.length} richtig.</p>`;
    document.querySelector(".progress-bar").style.width = "100%";
    return;
  }

  container.innerHTML = `
    <p><strong>${q.question}</strong></p>
    ${q.options.map((opt, i) => `<button onclick="checkAnswer(${i})">${opt}</button>`).join("")}
  `;

  document.querySelector(".progress-bar").style.width = `${(quizIndex / data.quiz.length) * 100}%`;
}

function checkAnswer(i) {
  if (i === data.quiz[quizIndex].correct) score++;
  quizIndex++;
  loadQuestion();
}

// FAKTEN
function showFact() {
  const factBox = document.getElementById("fact-box");
  const randomFact = data.facts[Math.floor(Math.random() * data.facts.length)];
  factBox.textContent = randomFact;
}
