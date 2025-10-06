let data;
let quizIndex = 0;
let score = 0;
let flipped = [];
let matchedCount = 0;

fetch("data.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    initQuiz();
    initMemory();
  })
  .catch(err => console.error("Fehler beim Laden von data.json:", err));

function showSection(id) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function initQuiz() { loadQuestion(); }

function loadQuestion() {
  const q = data.quiz[quizIndex];
  const container = document.getElementById("quiz-container");

  if (!q) {
    container.innerHTML = `<h3>🎉 Quiz beendet!</h3><p>Du hast ${score} von ${data.quiz.length} Fragen richtig.</p>`;
    document.querySelector(".progress-bar").style.width = "100%";
    return;
  }

  container.innerHTML = `
    <p><strong>Frage ${quizIndex + 1}:</strong> ${q.question}</p>
    ${q.options.map((opt, i) => `<button class="button" onclick="checkAnswer(${i})">${opt}</button>`).join("")}
  `;

  document.querySelector(".progress-bar").style.width = `${(quizIndex / data.quiz.length) * 100}%`;
}

function checkAnswer(i) {
  if (i === data.quiz[quizIndex].correct) score++;
  quizIndex++;
  loadQuestion();
}

function showFact() {
  const factBox = document.getElementById("fact-box");
  const randomFact = data.facts[Math.floor(Math.random() * data.facts.length)];
  factBox.textContent = randomFact;
}

function initMemory() {
  const grid = document.getElementById("memory-grid");
  const words = [...data.memoryWords, ...data.memoryWords].sort(() => 0.5 - Math.random());
  grid.innerHTML = "";
  words.forEach(word => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <div class="card-face card-back">🗳️</div>
      <div class="card-face card-front">${word}</div>
    `;
    card.addEventListener("click", () => flipCard(card, word));
    grid.appendChild(card);
  });
}

function flipCard(card, word) {
  if (flipped.length === 2 || card.classList.contains("flipped") || card.classList.contains("matched")) return;

  card.classList.add("flipped");
  flipped.push({ card, word });

  if (flipped.length === 2) {
    const [c1, c2] = flipped;
    if (c1.word === c2.word) {
      c1.card.classList.add("matched");
      c2.card.classList.add("matched");
      matchedCount++;
      if (matchedCount === data.memoryWords.length) {
        document.getElementById("memory-result").textContent = "🎉 Alle Paare gefunden!";
      }
    } else {
      setTimeout(() => {
        c1.card.classList.remove("flipped");
        c2.card.classList.remove("flipped");
      }, 1000);
    }
    flipped = [];
  }
}