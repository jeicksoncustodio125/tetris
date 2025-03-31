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
    const newLevel = Math.floor(score / 1000) + 1;
    if (newLevel > level) {
      level = newLevel;
      levelElement.textContent = level;
      dropInterval = Math.max(100, 1000 - (level - 1) * 100);
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
  if (gameOver) return;

  switch (e.keyCode) {
    case 37: // Seta esquerda
      movePiece("left");
      break;
    case 39: // Seta direita
      movePiece("right");
      break;
    case 40: // Seta baixo
      movePiece("down");
      break;
    case 38: // Seta cima
      rotate();
      break;
    case 32: // Espaço
      movePiece("drop");
      break;
    case 80: // Tecla P (pausa)
      togglePause();
      break;
  }
}

let isPaused = false;

function togglePause() {
  isPaused = !isPaused;
  if (isPaused) {
    cancelAnimationFrame(animationId);
  } else {
    dropStart = performance.now();
    animationId = requestAnimationFrame(drop);
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
  gameOverModal.style.display = "flex";
}

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

// Adiciona o evento de clique no botão
restartButton.addEventListener("click", restartGame);

// Inicia o jogo
init();
