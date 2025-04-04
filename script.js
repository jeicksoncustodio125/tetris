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
let musicPlaying = false;
let nameModalOpen = false;
let isMuted = false;
let skipNextDrop = false;

// Elementos do DOM
const boardElement = document.getElementById("board");
const nextPieceElement = document.getElementById("next-piece");
const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");

// Inicialização do jogo
async function init() {
  loadVolumeSettings();
  await renderRanking(); // ← força o ranking a aparecer sempre atualizado
  createBoardElements();
  createNextPieceElements();
  generatePiece();
  generateNextPiece();
  update();
  document.addEventListener("keydown", control);
  dropStart = performance.now();
  animationId = requestAnimationFrame(drop);
}

// Cria a matriz do tabuleiro

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
  // Desktop
  nextPieceElement.innerHTML = "";
  for (let y = 0; y < NEXT_ROWS; y++) {
    for (let x = 0; x < NEXT_COLS; x++) {
      const cell = document.createElement("div");
      cell.classList.add("next-cell");
      cell.id = `next-${y}-${x}`;
      nextPieceElement.appendChild(cell);
    }
  }

  // Mobile
  const nextPieceMobile = document.getElementById("next-piece-mobile");
  nextPieceMobile.innerHTML = "";
  for (let y = 0; y < NEXT_ROWS; y++) {
    for (let x = 0; x < NEXT_COLS; x++) {
      const cell = document.createElement("div");
      cell.classList.add("next-cell-mobile");
      cell.id = `next-mobile-${y}-${x}`;
      nextPieceMobile.appendChild(cell);
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
  for (let y = 0; y < NEXT_ROWS; y++) {
    for (let x = 0; x < NEXT_COLS; x++) {
      const cellDesktop = document.getElementById(`next-${y}-${x}`);
      const cellMobile = document.getElementById(`next-mobile-${y}-${x}`);
      if (cellDesktop) cellDesktop.className = "next-cell";
      if (cellMobile) cellMobile.className = "next-cell-mobile";
    }
  }

  for (let y = 0; y < nextPiece.shape.length; y++) {
    for (let x = 0; x < nextPiece.shape[y].length; x++) {
      if (nextPiece.shape[y][x]) {
        const cellDesktop = document.getElementById(`next-${y}-${x}`);
        const cellMobile = document.getElementById(`next-mobile-${y}-${x}`);
        if (cellDesktop) cellDesktop.classList.add(nextPiece.color);
        if (cellMobile) cellMobile.classList.add(nextPiece.color);
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
  function createNextPieceElements() {
    // versão desktop
    nextPieceElement.innerHTML = "";
    for (let y = 0; y < NEXT_ROWS; y++) {
      for (let x = 0; x < NEXT_COLS; x++) {
        const cell = document.createElement("div");
        cell.classList.add("next-cell");
        cell.id = `next-${y}-${x}`;
        nextPieceElement.appendChild(cell);
      }
    }

    // versão mobile
    const nextPieceMobile = document.getElementById("next-piece-mobile");
    nextPieceMobile.innerHTML = "";
    for (let y = 0; y < NEXT_ROWS; y++) {
      for (let x = 0; x < NEXT_COLS; x++) {
        const cell = document.createElement("div");
        cell.classList.add("next-cell-mobile");
        cell.id = `next-mobile-${y}-${x}`;
        nextPieceMobile.appendChild(cell);
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

function playLevelUpSound() {
  const sound = document.getElementById("levelUpSound");

  if (sound.paused) {
    sound.currentTime = 0;
    sound.play();
  }
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
    if (linesCleared === 4) {
      triggerTetrisAnimation();
      playLevelUpSound();
    }
    // Aumenta o nível a cada 10 linhas
    const newLevel = Math.floor(score / 400) + 1;
    if (newLevel > level) {
      level = newLevel;
      levelElement.textContent = level;
      dropInterval = Math.max(100, 1000 - (level - 1) * 100);
      playLevelUpSound();

      triggerLevelAnimation(level);

      if (level >= 10) {
        skipNextDrop = true;
      }
    }
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
    cancelAnimationFrame(animationId); // Para a animação
    pauseOverlay.style.display = "flex"; // Exibe a sobreposição de pausa
  } else {
    dropStart = performance.now();
    animationId = requestAnimationFrame(drop); // Retoma a animação
    pauseOverlay.style.display = "none"; // Oculta a sobreposição de pausa
  }

  // Bloqueia apenas os botões visuais (mobile)
  const buttons = ["leftBtn", "rightBtn", "rotateBtn", "dropBtn"];
  buttons.forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = isPaused;
  });
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
    renderRankingModal(); // ← Adicionado aqui
    gameOverModal.style.display = "flex";
  }
}
async function updateRanking(entry) {
  try {
    const response = await fetch(
      "https://x8ki-letl-twmt.n7.xano.io/api:E6ixH2CO/ranking",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao salvar no ranking");
    }

    // Aguarda salvar e depois atualiza a tabela com os dados mais novos
    await renderRanking();
  } catch (error) {
    console.error("Erro ao enviar para Xano:", error);
  }
}

async function renderRanking() {
  const tableBody = document.querySelector("#ranking-table tbody");
  tableBody.innerHTML = "";

  try {
    const response = await fetch(
      "https://x8ki-letl-twmt.n7.xano.io/api:E6ixH2CO/ranking"
    );
    const data = await response.json();

    data_tratada = [];

    for (i = 0; i < 10; i++) {
      data_tratada.push(data[i]);
    }

    data_tratada.forEach((entry, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${entry.name}</td>
        <td>${entry.score}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Erro ao carregar ranking:", error);
  }
}
async function renderRankingModal() {
  const tableBody = document.querySelector("#ranking-table-modal tbody");
  tableBody.innerHTML = "";

  try {
    const response = await fetch(
      "https://x8ki-letl-twmt.n7.xano.io/api:E6ixH2CO/ranking"
    );
    const data = await response.json();

    data.slice(0, 10).forEach((entry, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${entry.name}</td>
        <td>${entry.score}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Erro ao carregar ranking do modal:", error);
  }
}

document.getElementById("saveNameButton").addEventListener("click", () => {
  const input = document.getElementById("playerNameInput");
  const playerName = input.value.trim();
  if (playerName.length > 12) {
    alert("O nome deve ter no máximo 12 caracteres.");
    input.focus();
    return;
  }

  if (playerName) {
    updateRanking({ name: playerName, score });
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
  dropInterval = 1000;

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

function drop(timestamp) {
  if (gameOver || isPaused) return;

  if (skipNextDrop) {
    // Pula apenas UM ciclo
    skipNextDrop = false;
    dropStart = timestamp;
    animationId = requestAnimationFrame(drop);
    return;
  }

  const delta = timestamp - dropStart;

  if (delta > dropInterval) {
    movePiece("down");
    dropStart = timestamp;
  }

  animationId = requestAnimationFrame(drop);
}

// Adiciona o evento de clique no botão
restartButton.addEventListener("click", restartGame);

function triggerTetrisAnimation() {
  const anim = document.getElementById("tetrisAnimation");

  // Reinicia a animação
  anim.style.display = "block"; // Garante que esteja visível
  anim.style.animation = "none";
  void anim.offsetWidth;
  anim.style.animation =
    "rainbowText 1.5s linear forwards, rainbowPulse 1.5s ease-out forwards";

  // Oculta depois que a animação termina
  setTimeout(() => {
    anim.style.display = "none";
  }, 1500);
}

function triggerLevelAnimation(currentLevel) {
  const anim = document.getElementById("levelUpAnimation");

  anim.textContent = `NÍVEL ${currentLevel}`;
  anim.style.display = "block";
  anim.style.animation = "none";
  void anim.offsetWidth;

  // Inicia animação
  anim.style.animation = "levelPulse 0.8s ease-out forwards";

  // Usa requestAnimationFrame para esconder após X frames (~0.8s)
  const hideAfter = performance.now() + 800;

  function checkToHide(timestamp) {
    if (timestamp >= hideAfter) {
      anim.style.display = "none";
    } else {
      requestAnimationFrame(checkToHide);
    }
  }

  requestAnimationFrame(checkToHide);
}

function loadVolumeSettings() {
  const savedVolume = localStorage.getItem("gameVolume");
  const savedMuted = localStorage.getItem("gameMuted");

  if (savedVolume !== null) {
    volumeSlider.value = savedVolume;
    bgMusic.volume = savedMuted === "true" ? 0 : savedVolume / 100;
  }

  isMuted = savedMuted === "true";
  updateMuteButton();

  // Atualiza o gradiente do slider
  const percentage = volumeSlider.value / 100;
  volumeSlider.style.background = `linear-gradient(to right, #83c346 0%, #83c346 ${
    percentage * 100
  }%, #175b75 ${percentage * 100}%, #175b75 100%)`;
}
// Inicia o jogo
init();

// Controle de volume
volumeSlider.addEventListener("input", () => {
  const volume = volumeSlider.value / 100;
  bgMusic.volume = volume;
  isMuted = volume === 0;
  updateMuteButton();

  // Salva no localStorage
  localStorage.setItem("gameVolume", volumeSlider.value);
  localStorage.setItem("gameMuted", isMuted);
});

muteButton.addEventListener("click", () => {
  isMuted = !isMuted;
  if (isMuted) {
    bgMusic.volume = 0;
    volumeSlider.value = 0;
  } else {
    bgMusic.volume = (localStorage.getItem("gameVolume") || 50) / 100;
    volumeSlider.value = localStorage.getItem("gameVolume") || 50;
  }
  updateMuteButton();

  // Salva no localStorage
  localStorage.setItem("gameMuted", isMuted);
  localStorage.setItem("gameVolume", volumeSlider.value);
});

function updateMuteButton() {
  muteButton.textContent = isMuted ? "🔊 Ativar som" : "🔇 Mutar";
}

pauseOverlay.addEventListener("click", (e) => {
  // Se clicou diretamente no fundo do overlay (e não nos elementos internos)
  if (e.target === pauseOverlay && !gameOver && !nameModalOpen) {
    togglePause();
  }
});
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
document.getElementById("pauseMobileBtn").addEventListener("click", () => {
  if (!gameOver && !nameModalOpen) togglePause();
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
