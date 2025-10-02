let quizData = [];
let facts = [];
let truthLieSets = [];
let memoryWords = [];
let currentQuestion = 0, score = 0;
let flipped = [], matchedCount = 0;

// Navigation
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Daten laden
async function loadData() {
  const response = await fetch("data.json");
  const data = await response.json();

  quizData = data.quiz;
  facts = data.facts;
  truthLieSets = data.truthLie;
  memoryWords = data.memoryWords;

  loadQuestion();
  renderMemory();
}

// Quiz
function loadQuestion() {
  const container = document.querySelector('.quiz-container');
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
  if (answer === q.correct) { 
    result.textContent="✅ Richtig!";
    result.style.color="#00ff88";
    score++; 
  } else { 
    result.textContent="❌ Falsch.";
    result.style.color="#ff4444"; 
  }
  setTimeout(()=>{ currentQuestion++; loadQuestion(); },1000);
}

function updateProgress() {
  const percent = (currentQuestion / quizData.length) * 100;
  document.querySelector('.progress-bar').style.width = percent+"%";
}

// Fakten
function showFact() {
  document.getElementById('fact').textContent = facts[Math.floor(Math.random()*facts.length)];
}

// Memory
function renderMemory() {
  let cards = [...memoryWords, ...memoryWords].sort(() => 0.5 - Math.random());
  const grid = document.getElementById('memory-grid');
  grid.innerHTML = '';
  flipped = []; matchedCount = 0;
  cards.forEach((word,i)=>{
    const card=document.createElement('div');
    card.className='card';
    card.innerHTML=`<span>${word}</span>`;
    card.onclick=()=>flipCard(card,word);
    grid.appendChild(card);
  });
}

function flipCard(card,symbol) {
  if(card.classList.contains('flipped')||card.classList.contains('matched')) return;
  if(flipped.length===2) return;
  card.classList.add('flipped'); flipped.push(card);
  if(flipped.length===2) setTimeout(checkMatch,600);
}

function checkMatch() {
  const[c1,c2]=flipped;
  if(c1.innerText===c2.innerText){
    c1.classList.add('matched'); c2.classList.add('matched'); matchedCount++;
    if(matchedCount===memoryWords.length) document.getElementById('memory-result').textContent="🎉 Alle Paare gefunden!";
  } else { c1.classList.remove('flipped'); c2.classList.remove('flipped'); }
  flipped=[];
}

// Zwei Wahrheiten & eine Lüge
function newTruthLieRound() {
  const container = document.getElementById('truth-lie-options');
  const result = document.getElementById('truth-lie-result');
  result.textContent="";
  const set = truthLieSets[Math.floor(Math.random()*truthLieSets.length)];
  const shuffled = [...set.statements].map((s,i)=>({s,i})).sort(()=>Math.random()-0.5);

  container.innerHTML = shuffled.map(obj =>
    `<button class="button" onclick="checkTruthLie(${obj.i},${set.lie})">${obj.s}</button>`
  ).join('');
}

function checkTruthLie(choice,lie) {
  const result = document.getElementById('truth-lie-result');
  if(choice===lie){ result.textContent="❌ Das war die Lüge – gut erkannt!"; result.style.color="#00ff88"; }
  else{ result.textContent="✅ Das war eine Wahrheit. Versuche es nochmal!"; result.style.color="#ff4444"; }
}

// Init
window.onload=()=>{ loadData(); };
