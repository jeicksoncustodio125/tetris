// Configurações do jogo
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const NEXT_COLS = 4;
const NEXT_ROWS = 4;
const gameOverModal = document.getElementById("gameOverModal");
const finalScoreElement = document.getElementById("finalScore");
const finalLevelElement = document.getElementById("finalLevel");
const restartButton = document.getElementById("restartButton");
const pauseOverlay = document.getElementById("pause-overlay");
const bgMusic = document.getElementById("gameMusic");
const volumeSlider = document.getElementById("volumeRange");
const muteButton = document.getElementById("muteButton");
let musicPlaying = false;
let nameModalOpen = false;
let isMuted = false;
let challengeModalShown = false; // Variável para garantir que o modal apareça apenas uma vez

// Peças do Tetris e suas cores
const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

const COLORS = {
  I: "I",
  O: "O",
  T: "T",
  S: "S",
  Z: "Z",
  J: "J",
  L: "L",
};

// Variáveis do jogo
let board = createBoard();
let piece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let gameOver = false;
let dropInterval = 1000; // ms
let dropStart = null;
let animationId = null;

// Elementos do DOM
const boardElement = document.getElementById("board");
const nextPieceElement = document.getElementById("next-piece");
const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");

// Inicialização do jogo
function init() {
  createBoardElements();
  createNextPieceElements();
  generatePiece();
  generateNextPiece();
  update();
  renderRanking(); // <- Adicionado aqui
  document.addEventListener("keydown", control);
  dropStart = performance.now();
  animationId = requestAnimationFrame(drop);
}

// Cria a matriz do tabuleiro

function showChallengeModal() {
  challengeModal.style.display = "flex";
}

// Eventos de clique para os botões do modal
continueButton.addEventListener("click", () => {
  challengeModal.style.display = "none";
  // O jogo continua
  gameOver = false;
  dropStart = performance.now();
  animationId = requestAnimationFrame(drop);
  update();
});

restartChallengeButton.addEventListener("click", () => {
  restartGame();
  challengeModal.style.display = "none";
});

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// Cria os elementos HTML do tabuleiro
function createBoardElements() {
  boardElement.innerHTML = "";
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.id = `${y}-${x}`;
      boardElement.appendChild(cell);
    }
  }
}

// Cria os elementos HTML da próxima peça
function createNextPieceElements() {
  nextPieceElement.innerHTML = "";
  for (let y = 0; y < NEXT_ROWS; y++) {
    for (let x = 0; x < NEXT_COLS; x++) {
      const cell = document.createElement("div");
      cell.classList.add("next-cell");
      cell.id = `next-${y}-${x}`;
      nextPieceElement.appendChild(cell);
    }
  }
}

// Gera uma nova peça aleatória
function generatePiece() {
  if (nextPiece) {
    piece = nextPiece;
    piece.x = Math.floor(COLS / 2) - Math.floor(piece.shape[0].length / 2);
    piece.y = 0;
  } else {
    const shapes = Object.keys(SHAPES);
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    piece = {
      shape: SHAPES[randomShape],
      color: COLORS[randomShape],
      x: Math.floor(COLS / 2) - Math.floor(SHAPES[randomShape][0].length / 2),
      y: 0,
    };
  }

  // Verifica se a peça pode ser colocada (game over)
  if (collision()) {
    showGameOver();
    return;
  }
}

// Gera a próxima peça
function generateNextPiece() {
  const shapes = Object.keys(SHAPES);
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
  nextPiece = {
    shape: SHAPES[randomShape],
    color: COLORS[randomShape],
  };
  drawNextPiece();
}

// Desenha a próxima peça
function drawNextPiece() {
  // Limpa o display da próxima peça
  for (let y = 0; y < NEXT_ROWS; y++) {
    for (let x = 0; x < NEXT_COLS; x++) {
      const cell = document.getElementById(`next-${y}-${x}`);
      cell.className = "next-cell";
    }
  }

  // Desenha a próxima peça
  for (let y = 0; y < nextPiece.shape.length; y++) {
    for (let x = 0; x < nextPiece.shape[y].length; x++) {
      if (nextPiece.shape[y][x]) {
        const cell = document.getElementById(`next-${y}-${x}`);
        cell.classList.add(nextPiece.color);
      }
    }
  }
}

// Atualiza o tabuleiro
function update() {
  // Limpa o tabuleiro
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = document.getElementById(`${y}-${x}`);
      cell.className = "cell";
      if (board[y][x]) {
        cell.classList.add(COLORS[board[y][x]]);
      }
    }
  }

  // Desenha a peça atual
  if (piece) {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
            const cell = document.getElementById(`${boardY}-${boardX}`);
            cell.classList.add(piece.color);
          }
        }
      }
    }
  }
}

// Verifica colisão
function collision() {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const boardY = piece.y + y;
        const boardX = piece.x + x;

        if (
          boardY >= ROWS ||
          boardX < 0 ||
          boardX >= COLS ||
          (boardY >= 0 && board[boardY][boardX])
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

// Fixa a peça no tabuleiro
function lock() {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const boardY = piece.y + y;
        const boardX = piece.x + x;
        if (boardY >= 0) {
          board[boardY][boardX] = piece.color;
        }
      }
    }
  }

  // Verifica linhas completas
  checkLines();

  // Gera uma nova peça
  generatePiece();
  generateNextPiece();
}

// Verifica e remove linhas completas
function checkLines() {
  let linesCleared = 0;

  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every((cell) => cell !== 0)) {
      // Remove a linha
      board.splice(y, 1);
      // Adiciona uma nova linha vazia no topo
      board.unshift(Array(COLS).fill(0));
      linesCleared++;
      y++; // Verifica a mesma posição novamente
    }
  }

  // Atualiza a pontuação
  if (linesCleared > 0) {
    score += calculateScore(linesCleared);
    scoreElement.textContent = score;

    // Aumenta o nível a cada 10 linhas
    const newLevel = Math.floor(score / 200) + 1;
    if (newLevel > level) {
      level = newLevel;
      levelElement.textContent = level;
      dropInterval = Math.max(100, 600 - (level - 1) * 100);
    }
  }

  // Exibe o modal de vitória quando a pontuação atingir 200 e o modal ainda não foi mostrado
  if (score >= 200 && !challengeModalShown) {
    showChallengeModal();
    challengeModalShown = true; // Marca que o modal foi mostrado
  }
}

// Calcula a pontuação
function calculateScore(lines) {
  switch (lines) {
    case 1:
      return 100 * level;
    case 2:
      return 300 * level;
    case 3:
      return 500 * level;
    case 4:
      return 800 * level;
    default:
      return 0;
  }
}

// Rotaciona a peça
function rotate() {
  const originalShape = piece.shape;
  const rows = piece.shape.length;
  const cols = piece.shape[0].length;

  // Transposta da matriz
  const newShape = Array(cols)
    .fill()
    .map(() => Array(rows).fill(0));

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      newShape[x][rows - 1 - y] = piece.shape[y][x];
    }
  }

  piece.shape = newShape;

  // Se houver colisão, desfaz a rotação
  if (collision()) {
    piece.shape = originalShape;
  }

  update();
}

// Movimenta a peça
function movePiece(direction) {
  switch (direction) {
    case "left":
      piece.x--;
      if (collision()) piece.x++;
      break;
    case "right":
      piece.x++;
      if (collision()) piece.x--;
      break;
    case "down":
      piece.y++;
      if (collision()) {
        piece.y--;
        lock();
      }
      break;
    case "drop":
      while (!collision()) {
        piece.y++;
      }
      piece.y--;
      lock();
      break;
  }
  update();
}

// Controles do teclado
function control(e) {
  if (nameModalOpen) {
    // ENTER confirma nome
    if (e.key === "Enter") {
      document.getElementById("saveNameButton").click();
    }
    return;
  }

  if (!musicPlaying) {
    bgMusic
      .play()
      .then(() => {
        musicPlaying = true;
      })
      .catch((err) => {
        console.log("Erro ao tentar tocar música:", err);
      });
  }

  const key = e.key.toLowerCase();

  if (
    isPaused &&
    [
      "arrowleft",
      "arrowright",
      "arrowup",
      "arrowdown",
      " ",
      "a",
      "d",
      "w",
      "s",
    ].includes(key)
  ) {
    togglePause();
  }

  if (isPaused && key !== "p") return;

  switch (key) {
    case "arrowleft":
    case "a":
      movePiece("left");
      break;
    case "arrowright":
    case "d":
      movePiece("right");
      break;
    case "arrowdown":
    case "s":
      movePiece("down");
      break;
    case "arrowup":
    case "w":
      rotate();
      break;
    case " ":
      movePiece("drop");
      break;
    case "p":
      togglePause();
      break;
    case "r":
      if (gameOver) restartGame();
      break;
    case "enter":
      if (gameOver && !nameModalOpen) {
        restartGame();
      }
      break;
  }
}

let isPaused = false;

function togglePause() {
  isPaused = !isPaused;

  if (isPaused) {
    cancelAnimationFrame(animationId);
    pauseOverlay.style.display = "flex";
    console.log("Jogo pausado");

    // Pausa a música se estiver tocando
    if (musicPlaying) {
      bgMusic.pause();
    }
  } else {
    dropStart = performance.now();
    animationId = requestAnimationFrame(drop);
    pauseOverlay.style.display = "none";
    console.log("Jogo despausado");

    // Despausa a música se estava tocando antes
    if (musicPlaying) {
      bgMusic.play().catch((e) => console.log("Erro ao retomar música:", e));
    }
  }
}

// Modifique a função drop() para verificar se está pausado
function drop(timestamp) {
  if (gameOver || isPaused) return;

  const delta = timestamp - dropStart;

  if (delta > dropInterval) {
    movePiece("down");
    dropStart = timestamp;
  }

  animationId = requestAnimationFrame(drop);
}
// Loop principal do jogo

function showGameOver() {
  gameOver = true;
  cancelAnimationFrame(animationId);
  finalScoreElement.textContent = score;
  finalLevelElement.textContent = level;

  const ranking = JSON.parse(localStorage.getItem("ranking")) || [];
  const lowestScore =
    ranking.length < 10 ? 0 : ranking[ranking.length - 1].score;

  // Se for top 10 e score > 0 → pede nome
  if (score > 0 && (ranking.length < 10 || score > lowestScore)) {
    nameModalOpen = true;
    document.getElementById("nameModal").style.display = "flex";
    document.getElementById("playerNameInput").focus();
  } else {
    // Senão, mostra o Game Over direto
    gameOverModal.style.display = "flex";
  }
}
function updateRanking(entry) {
  const ranking = JSON.parse(localStorage.getItem("ranking")) || [];

  // Adiciona nova entrada
  ranking.push(entry);

  // Ordena do maior para o menor
  ranking.sort((a, b) => b.score - a.score);

  // Limita a 10 entradas
  const top10 = ranking.slice(0, 10);

  // Salva de volta
  localStorage.setItem("ranking", JSON.stringify(top10));
}

function renderRanking() {
  const ranking = JSON.parse(localStorage.getItem("ranking")) || [];
  const tableBody = document.querySelector("#ranking-table tbody");

  tableBody.innerHTML = ""; // Limpa tabela

  ranking.forEach((entry, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.name}</td>
      <td>${entry.score}</td>
    `;
    tableBody.appendChild(row);
  });
}
document.getElementById("saveNameButton").addEventListener("click", () => {
  const input = document.getElementById("playerNameInput");
  const playerName = input.value.trim();

  if (playerName) {
    updateRanking({ name: playerName, score });
    renderRanking();
    input.value = "";
    document.getElementById("nameModal").style.display = "none";
    nameModalOpen = false;

    // Depois de salvar o nome, mostra o Game Over
    finalScoreElement.textContent = score;
    finalLevelElement.textContent = level;
    gameOverModal.style.display = "flex";
  } else {
    input.focus();
  }
});
function restartGame() {
  // Reseta o jogo
  board = createBoard();
  score = 0;
  level = 1;
  gameOver = false;
  dropInterval = 600;

  // Atualiza a interface
  scoreElement.textContent = score;
  levelElement.textContent = level;

  // Esconde o modal
  gameOverModal.style.display = "none";

  // Gera novas peças
  generatePiece();
  generateNextPiece();

  // Reinicia o loop do jogo
  dropStart = performance.now();
  animationId = requestAnimationFrame(drop);
  update();
}

// Adiciona o evento de clique no botão
restartButton.addEventListener("click", restartGame);

// Inicia o jogo
init();

// Controle de volume
volumeSlider.addEventListener("input", () => {
  const volume = volumeSlider.value / 100;
  bgMusic.volume = volume;
  isMuted = volume === 0;
  updateMuteButton();
});

muteButton.addEventListener("click", () => {
  isMuted = !isMuted;
  if (isMuted) {
    bgMusic.volume = 0;
    volumeSlider.value = 0;
  } else {
    bgMusic.volume = 1;
    volumeSlider.value = 100;
  }
  updateMuteButton();
});

function updateMuteButton() {
  muteButton.textContent = isMuted ? "🔊 Ativar som" : "🔇 Mutar";
}

// Controles de toque para mobile
document.getElementById("leftBtn").addEventListener("click", () => {
  if (!gameOver && !nameModalOpen) movePiece("left");
});

document.getElementById("rightBtn").addEventListener("click", () => {
  if (!gameOver && !nameModalOpen) movePiece("right");
});

document.getElementById("rotateBtn").addEventListener("click", () => {
  if (!gameOver && !nameModalOpen) rotate();
});

document.getElementById("dropBtn").addEventListener("click", () => {
  if (!gameOver && !nameModalOpen) movePiece("down");
});

volumeRange.addEventListener("input", function () {
  const value = this.value;
  const percentage = value / this.max;

  // CORRIGIDO: agora começa com azul e vai para verde
  this.style.background = `linear-gradient(to right, #83c346 0%, #83c346 ${
    percentage * 100
  }%, #175b75 ${percentage * 100}%, #175b75 100%)`;
});

// Inicialização também corrigida
window.addEventListener("load", function () {
  const initialValue = volumeRange.value;
  const initialPercentage = initialValue / volumeRange.max;
  volumeRange.style.background = `linear-gradient(to right, #83c346 0%, #83c346 ${
    initialPercentage * 100
  }%, #175b75 ${initialPercentage * 100}%, #175b75 100%)`;
});
