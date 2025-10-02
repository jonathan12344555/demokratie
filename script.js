let quizData = [];
let facts = [];
let truthLieSets = [];
let memoryWords = [];

let currentQuestion = 0;
let score = 0;
let cards = [];
let flipped = [];
let matchedCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.target));
  });

  document.getElementById('fact-button').addEventListener('click', showFact);
  document.getElementById('truth-lie-new').addEventListener('click', newTruthLieRound);

  fetch('data.json')
    .then(res => res.json())
    .then(data => {
      quizData = data.quiz;
      facts = data.facts;
      truthLieSets = data.truthLie;
      memoryWords = data.memoryWords;

      loadQuestion();
      renderMemory();
    })
    .catch(err => console.error('Fehler beim Laden der JSON:', err));
});

function showSection(id){
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Der Rest des Codes (Quiz, Memory, Fakten, Wahrheiten/Lügen) kann aus deinem bestehenden script.js übernommen werden
