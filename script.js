// ===== Daten aus data.js =====
let quizData = data.quiz;
let facts = data.facts;
let truthLieSets = data.truthLie;
let memoryWords = data.memoryWords;

let currentQuestion = 0;
let score = 0;
let cards = [];
let flipped = [];
let matchedCount = 0;

// ===== Navigation =====
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.target));
  });

  document.getElementById('fact-button').addEventListener('click', showFact);
  document.getElementById('truth-lie-new').addEventListener('click', newTruthLieRound);

  loadQuestion();
  renderMemory();
});

function showSection(id){
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ===== Quiz =====
function loadQuestion(){
  const container = document.querySelector('.quiz-container');
  container.innerHTML = '';

  if(currentQuestion < quizData.length){
    const q = quizData[currentQuestion];
    const p = document.createElement('p');
    p.innerHTML = `<strong>Frage ${currentQuestion+1} von ${quizData.length}:</strong> ${q.question}`;
    container.appendChild(p);

    q.options.forEach((opt,i)=>{
      const btn = document.createElement('button');
      btn.className='button';
      btn.textContent=`${String.fromCharCode(65+i)}) ${opt}`;
      btn.addEventListener('click', ()=>checkAnswer(i));
      container.appendChild(btn);
    });

    const res = document.createElement('p');
    res.id='quiz-result';
    container.appendChild(res);

    updateProgress();
  } else {
    container.innerHTML = `<h3>🎉 Quiz beendet!</h3><p>Du hast <strong>${score} von ${quizData.length}</strong> Fragen richtig beantwortet.</p>`;
    document.querySelector('.progress-bar').style.width = "100%";
  }
}

function checkAnswer(answer){
  const q = quizData[currentQuestion];
  const result = document.getElementById('quiz-result');

  if(answer === q.correct){
    result.textContent = "✅ Richtig!";
    result.style.color = "#00ff88";
    score++;
  } else {
    result.textContent = "❌ Falsch.";
    result.style.color = "#ff4444";
  }

  setTimeout(() => {
    currentQuestion++;
    loadQuestion();
  }, 1000);
}

function updateProgress(){
  const percent = (currentQuestion / quizData.length) * 100;
  document.querySelector('.progress-bar').style.width = percent + "%";
}

// ===== Fakten =====
function showFact(){
  document.getElementById('fact').textContent = facts[Math.floor(Math.random()*facts.length)];
}

// ===== Memory =====
function renderMemory(){
  const grid = document.getElementById('memory-grid');
  grid.innerHTML = '';
  cards = [...memoryWords, ...memoryWords].sort(() => 0.5 - Math.random());
  flipped = [];
  matchedCount = 0;

  cards.forEach(word => {
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = "❓";
    card.addEventListener('click', () => flipCard(card, word));
    grid.appendChild(card);
  });
}

function flipCard(card, word){
  if(card.classList.contains('flipped') || card.classList.contains('matched')) return;
  if(flipped.length === 2) return;

  card.textContent = word;
  card.classList.add('flipped');
  flipped.push(card);

  if(flipped.length === 2) setTimeout(checkMatch, 600);
}

function checkMatch(){
  const [c1, c2] = flipped;

  if(c1.textContent === c2.textContent){
    c1.classList.add('matched');
    c2.classList.add('matched');
    matchedCount++;
    if(matchedCount === memoryWords.length){
      document.getElementById('memory-result').textContent = "🎉 Alle Paare gefunden!";
    }
  } else {
    c1.textContent = "❓"; c1.classList.remove('flipped');
    c2.textContent = "❓"; c2.classList.remove('flipped');
  }

  flipped = [];
}

// ===== Zwei Wahrheiten & eine Lüge =====
function newTruthLieRound(){
  const container = document.getElementById('truth-lie-options');
  const result = document.getElementById('truth-lie-result');
  container.innerHTML = "";
  result.textContent = "";

  const set = truthLieSets[Math.floor(Math.random()*truthLieSets.length)];
  set.statements.forEach((s,i)=>{
    const btn = document.createElement('button');
    btn.className = 'button';
    btn.textContent = s;
    btn.addEventListener('click', () => checkTruthLie(i, set.lie));
    container.appendChild(btn);
  });
}

function checkTruthLie(choice, lie){
  const result = document.getElementById('truth-lie-result');
  if(choice === lie){
    result.textContent = "❌ Das war die Lüge – gut erkannt!";
    result.style.color = "#00ff88";
  } else {
    result.textContent = "✅ Das war eine Wahrheit. Versuche es nochmal!";
    result.style.color = "#ff4444";
  }
}
