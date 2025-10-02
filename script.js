// ====== Variablen ======
let quizData = [], facts = [], truthLieSets = [], memoryWords = [];
let currentQuestion = 0, score = 0;
let cards = [], flipped = [], matchedCount = 0;

// ====== Navigation ======
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ====== Daten laden ======
fetch("data.json")
  .then(res => res.json())
  .then(data => {
    quizData = data.quiz;
    facts = data.facts;
    truthLieSets = data.truthLie;
    memoryWords = data.memoryWords;

    loadQuestion();
    renderMemory();
  });

// ====== Quiz ======
function loadQuestion() {
  const container = document.querySelector('.quiz-container');
  container.innerHTML = "";
  if (currentQuestion < quizData.length) {
    const q = quizData[currentQuestion];
    container.innerHTML = `
      <p><strong>Frage ${currentQuestion+1} von ${quizData.length}:</strong> ${q.question}</p>
      ${q.options.map((opt,i)=>`<button class="button" onclick="checkAnswer(${i})">${String.fromCharCode(65+i)}) ${opt}</button>`).join('')}
      <p id="quiz-result"></p>`;
    updateProgress();
  } else {
    container.innerHTML = `<h3>🎉 Quiz beendet!</h3><p>Du hast <strong>${score} von ${quizData.length}</strong> Fragen richtig beantwortet.</p>`;
    document.querySelector('.progress-bar').style.width = "100%";
  }
}

function checkAnswer(answer) {
  const q = quizData[currentQuestion];
  const result = document.getElementById('quiz-result');
  if(answer === q.correct){ result.textContent="✅ Richtig!"; result.style.color="#00ff88"; score++; }
  else { result.textContent="❌ Falsch."; result.style.color="#ff4444"; }
  setTimeout(()=>{ currentQuestion++; loadQuestion(); },1000);
}

function updateProgress() {
  const percent = (currentQuestion / quizData.length) * 100;
  document.querySelector('.progress-bar').style.width = percent+"%";
}

// ====== Fakten ======
function showFact() {
  document.getElementById('fact').textContent = facts[Math.floor(Math.random()*facts.length)];
}

// ====== Memory ======
function renderMemory() {
  const grid = document.getElementById('memory-grid');
  grid.innerHTML = "";
  cards = [...memoryWords, ...memoryWords].sort(() => 0.5 - Math.random());
  flipped = []; matchedCount = 0;

  cards.forEach(word=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = "❓";
    card.onclick = ()=>flipCard(card, word);
    grid.appendChild(card);
  });
}

function flipCard(card, word) {
  if(card.classList.contains('flipped') || card.classList.contains('matched')) return;
  if(flipped.length === 2) return;
  card.textContent = word;
  card.classList.add('flipped'); flipped.push(card);
  if(flipped.length === 2) setTimeout(checkMatch,600);
}

function checkMatch() {
  const [c1, c2] = flipped;
  if(c1.textContent === c2.textContent){
    c1.classList.add('matched'); c2.classList.add('matched'); matchedCount++;
    if(matchedCount === memoryWords.length) document.getElementById('memory-result').textContent="🎉 Alle Paare gefunden!";
  } else {
    c1.textContent="❓"; c1.classList.remove('flipped');
    c2.textContent="❓"; c2.classList.remove('flipped');
  }
  flipped=[];
}

// ====== Zwei Wahrheiten & eine Lüge ======
function newTruthLieRound() {
  con
