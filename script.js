let data;
let currentQuestion = 0;
let score = 0;

fetch('data.json')
  .then(response => response.json())
  .then(json => {
    data = json;
    initQuiz();
    showFact();
    generateTruthGame();
    generateMemoryGame();
  });

function showSection(id) {
  document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.getElementById('truth-result').textContent = '';
  document.getElementById('memory-result').textContent = '';
}

function initQuiz() {
  currentQuestion = 0;
  score = 0;
  document.querySelector('.progress-bar').style.width = '0%';
  showQuestion(data.quiz[currentQuestion]);
}

function showQuestion(q) {
  const container = document.getElementById('quiz-container');
  container.innerHTML = `
    <h3>${q.question}</h3>
    ${q.options.map((opt, i) => `<button class="btn" onclick="checkAnswer(${i})">${opt}</button>`).join('')}
  `;
  document.getElementById('score-display').textContent = '';
}

function checkAnswer(i) {
  const correct = data.quiz[currentQuestion].correct;
  const buttons = document.querySelectorAll('#quiz-container button');
  buttons.forEach(btn => btn.disabled = true);

  if (i === correct) {
    buttons[i].style.backgroundColor = '#4caf50';
    score++;
  } else {
    buttons[i].style.backgroundColor = '#e74c3c';
    buttons[correct].style.backgroundColor = '#4caf50';
  }

  setTimeout(() => {
    currentQuestion++;
    document.querySelector('.progress-bar').style.width = (currentQuestion / data.quiz.length) * 100 + '%';
    if (currentQuestion < data.quiz.length) {
      showQuestion(data.quiz[currentQuestion]);
    } else {
      document.getElementById('quiz-container').innerHTML = '<h3>Quiz beendet!</h3>';
      document.getElementById('score-display').textContent = `Du hast ${score} von ${data.quiz.length} Punkten erreicht!`;
      document.querySelector('.progress-bar').style.width = '100%';
    }
  }, 800);
}

function showFact() {
  const factBox = document.getElementById('fact-box');
  const fact = data.facts[Math.floor(Math.random() * data.facts.length)];
  factBox.textContent = fact;
}

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

let memoryCards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchesFound = 0;

function generateMemoryGame() {
  const facts = data.facts.slice();
  const cardPool = [];
  facts.forEach((f, idx) => {
    cardPool.push({ id: idx + '-a', text: f });
    cardPool.push({ id: idx + '-b', text: f });
  });
  const shuffled = cardPool.sort(() => 0.5 - Math.random());
  memoryCards = shuffled;
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  matchesFound = 0;
  const container = document.getElementById('memory-container');
  container.innerHTML = shuffled.map(card => `
    <div class="memory-card" data-id="${card.id}" data-text="${card.text.replace(/"/g, '&quot;')}">
      <div class="card-front">?</div>
      <div class="card-back">${card.text}</div>
    </div>
  `).join('');
  document.querySelectorAll('.memory-card').forEach(card => card.addEventListener('click', onMemoryCardClick));
  document.getElementById('memory-result').textContent = '';
}

function onMemoryCardClick(e) {
  const card = e.currentTarget;
  if (lockBoard || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  if (!firstCard) {
    firstCard = card;
    return;
  }
  secondCard = card;
  lockBoard = true;
  const t1 = firstCard.dataset.text;
  const t2 = secondCard.dataset.text;
  if (t1 === t2) {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    matchesFound += 1;
    resetBoard();
    if (matchesFound === memoryCards.length / 2) {
      document.getElementById('memory-result').textContent = '🎉 Alle Paare gefunden! Gut gemacht.';
    }
  } else {
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetBoard();
    }, 1000);
  }
}
function resetBoard() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}
