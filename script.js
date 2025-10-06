let data;
let quizIndex = 0;
let score = 0;
let flippedCards = [];
let matchedPairs = 0;

// Daten laden
fetch("data.json")
  .then((res) => res.json())
  .then((json) => {
    data = json;
    initQuiz();
    initMemory();
  })
  .catch((err) => console.error("Fehler beim Laden von data.json:", err));

// Navigation
function showSection(id) {
  document.querySelectorAll("section").forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// === QUIZ ===
function initQuiz() {
  loadQuestion();
}

function loadQuestion() {
  const q = data.quiz[quizIndex];
  const container = document.getElementById("quiz-container");

  if (!q) {
    container.innerHTML = `<h3>🎉 Quiz beendet!</h3><p>Du hast ${score} von ${data.quiz.length} Fragen richtig beantwortet.</p>`;
    document.querySelector(".progress-bar").style.width = "100%";
    return;
  }

  container.innerHTML = `
    <p><strong>Frage ${quizIndex + 1}:</strong> ${q.question}</p>
    ${q.options
      .map(
        (opt, i) => `<button class="button" onclick="checkAnswer(${i})">${opt}</button>`
      )
      .join("")}
  `;

  document.querySelector(".progress-bar").style.width = `${
    (quizIndex / data.quiz.length) * 100
  }%`;
}

function checkAnswer(i) {
  if (i === data.quiz[quizIndex].correct) score++;
  quizIndex++;
  loadQuestion();
}

// === FAKTEN ===
function showFact() {
  const factBox = document.getElementById("fact-box");
  const randomFact = data.facts[Math.floor(Math.random() * data.facts.length)];
  factBox.textContent = randomFact;
}

// === MEMORY ===
function initMemory() {
  const grid = document.getElementById("memory-grid");
  const words = [...data.memoryWords, ...data.memoryWords].sort(() => 0.5 - Math.random());

  grid.innerHTML = "";
  flippedCards = [];
  matchedPairs = 0;

  words.forEach((word) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">🗳️</div>
        <div class="card-back">${word}</div>
      </div>
    `;

    card.addEventListener("click", () => flipCard(card, word));
    grid.appendChild(card);
  });
}

function flipCard(card, word) {
  if (flippedCards.length === 2 || card.classList.contains("flipped")) return;

  card.classList.add("flipped");
  flippedCards.push({ card, word });

  if (flippedCards.length === 2) {
    const [first, second] = flippedCards;

    if (first.word === second.word) {
      first.card.classList.add("matched");
      second.card.classList.add("matched");
      flippedCards = [];
      matchedPairs++;

      if (matchedPairs === data.memoryWords.length) {
        document.getElementById("memory-result").textContent = "🎉 Alle Paare gefunden!";
      }
    } else {
      setTimeout(() => {
        first.card.classList.remove("flipped");
        second.card.classList.remove("flipped");
        flippedCards = [];
      }, 1000);
    }
  }
}
