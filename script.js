let data;
let currentQuestion = 0;
let score = 0;
let audioCtx = null;

fetch('data.json').then(r=>r.json()).then(json=>{
  data = json;
  initQuiz();
  showFact();
  generateTruthGame();
  generateMemoryGame();
}).catch(err=>console.error('Fehler beim Laden data.json',err));

function ensureAudio(){
  if(audioCtx) return;
  try{ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ audioCtx = null; }
}

function playTone(freq=440,dur=0.12,vol=0.06){
  if(!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type='sine'; o.frequency.value = freq;
  g.gain.value = vol;
  o.connect(g); g.connect(audioCtx.destination);
  o.start(); setTimeout(()=>{ o.stop(); }, dur*1000);
}

/* Navigation */
function showSection(id){
  document.querySelectorAll('main section').forEach(s=>s.classList.remove('active'));
  const el = document.getElementById(id);
  if(el) el.classList.add('active');

  // Aktive Section speichern, damit Zustand nach Reload erhalten bleibt
  localStorage.setItem('activeSection', id);

  // reset small result areas
  const tr = document.getElementById('truth-result'); if(tr) tr.textContent='';
  const mr = document.getElementById('memory-result'); if(mr) mr.textContent='';
}

// Nach Laden der Seite letzten aktiven Bereich anzeigen, Standard ist "home"
window.addEventListener('load', () => {
  const activeSection = localStorage.getItem('activeSection');
  if(activeSection) {
    showSection(activeSection);
  } else {
    showSection('home');
  }
});

/* ===== QUIZ ===== */
function initQuiz(){
  currentQuestion=0; score=0;
  updateProgress();
  renderQuestion();
}

function updateProgress(){
  const p = document.querySelector('.progress-bar');
  if(!p) return;
  const pct = Math.round((currentQuestion / (data.quiz.length)) * 100);
  p.style.width = pct + '%';
}

function renderQuestion(){
  const q = data.quiz[currentQuestion];
  const container = document.getElementById('quiz-container');
  if(!q){ container.innerHTML='<h3>Keine Frage verfügbar</h3>'; return; }
  const opts = q.options.map((o,i)=>`<button class="option-btn" onclick="answerQuiz(${i})">${o}</button>`).join('');
  container.innerHTML = `<div class="quiz-inner"><h3>${q.question}</h3><div class="options">${opts}</div></div>`;
  document.getElementById('score-display').textContent='';
  ensureAudio();
}

function answerQuiz(idx){
  ensureAudio();
  const q = data.quiz[currentQuestion];
  const buttons = Array.from(document.querySelectorAll('#quiz-container .option-btn'));
  buttons.forEach(b=>b.disabled=true);
  const correct = q.correct;
  if(idx===correct){
    buttons[idx].style.background = 'linear-gradient(90deg,var(--success),#2e7d32)';
    document.getElementById('score-display').textContent = 'Richtig!';
    playTone(880,0.09,0.06);
    score++;
  } else {
    buttons[idx].style.background = 'linear-gradient(90deg,var(--danger),#b71c1c)';
    buttons[correct].style.background = 'linear-gradient(90deg,var(--success),#2e7d32)';
    document.getElementById('score-display').textContent = 'Leider falsch.';
    playTone(240,0.15,0.06);
  }
  setTimeout(()=>{
    currentQuestion++;
    if(currentQuestion < data.quiz.length){
      renderQuestion();
      updateProgress();
    } else {
      document.getElementById('quiz-container').innerHTML = `<h3>Quiz beendet!</h3><p class="score-display">Du hast ${score} von ${data.quiz.length} Punkten erreicht.</p>`;
      document.querySelector('.progress-bar').style.width = '100%';
      // final sound
      playTone(660,0.12,0.06);
    }
  },700);
}

/* ===== FACTS ===== */
function pickFact(){
  const f = data.facts[Math.floor(Math.random()*data.facts.length)];
  if(typeof f === 'string') return {text:f, expl:''};
  return {text:f.text || '', expl: f.expl || ''};
}

function showFact(){
  const fb = document.getElementById('fact-box');
  const f = pickFact();
  fb.innerHTML = `<div class="fact-text">${f.text}</div>${f.expl? `<div class="fact-expl">${f.expl}</div>` : ''}`;
}

/* ===== TRUTH GAME ===== */
function generateTruthGame(){
  const facts = data.facts.map(f=> typeof f === 'string' ? f : f.text );
  const trueFact = facts[Math.floor(Math.random()*facts.length)];
  const fakeFacts = [
    "Österreich ist eine absolute Monarchie.",
    "Das Wahlalter beträgt 25 Jahre.",
    "Der Bundespräsident wird auf Lebenszeit gewählt.",
    "Das Parlament besteht aus 50 Mitgliedern.",
    "Die Neutralität wurde im Jahr 1800 beschlossen."
  ];
  const selectedFakes = fakeFacts.sort(()=>0.5-Math.random()).slice(0,2);
  const options = [trueFact,...selectedFakes].sort(()=>0.5-Math.random());
  const container = document.getElementById('truthgame-container');
  container.dataset.true = trueFact;
  container.innerHTML = options.map(o=>`<button class="btn" onclick="checkTruth('${o.replace(/'/g,"\\'")}')">${o}</button>`).join('');
  document.getElementById('truth-result').textContent='';
}

function checkTruth(sel){
  ensureAudio();
  const trueFact = document.getElementById('truthgame-container').dataset.true;
  const res = document.getElementById('truth-result');
  if(sel === trueFact){
    res.textContent = '✅ Richtig!';
    res.style.color = 'var(--success)';
    playTone(880,0.09,0.06);
  } else {
    res.textContent = '❌ Falsch — das war eine Lüge.';
    res.style.color = 'var(--danger)';
    playTone(240,0.12,0.06);
  }
}

/* ===== MEMORY ===== */
let memoryState = {cards:[], first:null, second:null, lock:false, matches:0};

function generateMemoryGame(){
  const facts = data.facts.map(f=> typeof f === 'string' ? {text:f, expl:''} : f );
  const pool = [];
  facts.forEach((f,i)=>{
    pool.push({id:`${i}a`,text:f.text, expl:f.expl});
    pool.push({id:`${i}b`,text:f.text, expl:f.expl});
  });
  const shuffled = pool.sort(()=>0.5-Math.random());
  memoryState.cards = shuffled;
  memoryState.first = null; memoryState.second = null; memoryState.lock=false; memoryState.matches=0;
  const container = document.getElementById('memory-container');
  container.innerHTML = shuffled.map(c=>`
    <div class="memory-card" data-id="${c.id}" data-text="${c.text.replace(/"/g,'&quot;')}" tabindex="0" role="button" aria-pressed="false">
      <div class="card-inner">
        <div class="card-front">?</div>
        <div class="card-back">${c.text}</div>
      </div>
    </div>
  `).join('');
  document.querySelectorAll('.memory-card').forEach(el=>el.addEventListener('click', onCardClick));
  document.getElementById('memory-result').textContent='';
}

function onCardClick(e){
  const el = e.currentTarget;
  if(memoryState.lock) return;
  if(el.classList.contains('matched') || el.classList.contains('flipped')) return;
  // flip
  el.classList.add('flipped');
  if(!memoryState.first){ memoryState.first = el; return; }
  memoryState.second = el; memoryState.lock = true;
  const t1 = memoryState.first.dataset.text;
  const t2 = memoryState.second.dataset.text
