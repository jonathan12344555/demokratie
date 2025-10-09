let data;

fetch('data.json')
  .then(response => response.json())
  .then(json => {
    data = json;
    initQuiz();
    showFact();
    generateTruthGame();
  });

function showSection(id) {
  document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ========= QUIZ ========= */
let currentQuestion = 0;
function initQuiz() {
  const quiz = data.quiz;
  showQuestion(quiz[currentQuestion]);
}
function showQuestion(q) {
  const container = document.getElementById('quiz-container');
  container.innerHTML = `
    <h3>${q.question}</h3>
    ${q.options.map((opt, i) => `<button class="btn" onclick="checkAnswer(${i})">${opt}</button>`).join('')}
  `;
}
function checkAnswer(i) {
  const correct = data.quiz[currentQuestion].correct;
  const buttons = document.querySelectorAll('#quiz-container button');
  buttons.forEach(btn => btn.disabled = true);
  buttons[i].style.backgroundColor = i === correct ? '#4caf50' : '#e74c3c';

  setTimeout(() => {
    currentQuestion++;
    if (currentQuestion < data.quiz.length) {
      showQuestion(data.quiz[currentQuestion]);
      document.querySelector('.progress-bar').style.width = (currentQuestion / data.quiz.length) * 100 + '%';
    } else {
      document.getElementById('quiz-container').innerHTML = '<h3>Quiz beendet!</h3>';
      document.querySelector('.progress-bar').style.width = '100%';
    }
  }, 800);
}

/* ========= FAKTEN ========= */
function showFact() {
  const factBox = document.getElementById('fact-box');
  const fact = data.facts[Math.floor(Math.random() * data.facts.length)];
  factBox.textContent = fact;
}

/* ========= 2 LÜGEN, 1 WAHRHEIT ========= */
function generateTruthGame() {
  const facts = data.facts;
  const trueFact = facts[Math.floor(Math.random() * facts.length)];

  const fakeFacts = [
    "Österreich ist eine absolute Monarchie.",
    "Das Wahlalter beträgt 25 Jahre.",
    "Der Bundespräsident wird auf Lebenszeit gewählt.",
    "Das Parlament besteht aus 50 Mitgliedern.",
    "Die Neutralität wurde im Jahr 1800 beschlossen."
  ];

  const selectedFakes = fakeFacts.sort(() => 0.5 - Math.random()).slice(0, 2);

  const statements = [trueFact, ...selectedFakes].sort(() => 0.5 - Math.random());
  const container = document.getElementById('truthgame-container');
  const result = document.getElementById('truth-result');
  result.textContent = "";

  container.innerHTML = statements
    .map((s, i) => `<button class="btn" onclick="checkTruth('${s.replace(/'/g, "\'")}')">${s}</button>`)
    .join('');
  container.dataset.true = trueFact;
}

function checkTruth(selected) {
  const trueFact = document.getElementById('truthgame-container').dataset.true;
  const result = document.getElementById('truth-result');

  if (selected === trueFact) {
    result.textContent = "✅ Richtig! Das ist die Wahrheit.";
    result.style.color = "#4caf50";
  } else {
    result.textContent = "❌ Falsch! Versuch’s nochmal.";
    result.style.color = "#e74c3c";
  }
}
