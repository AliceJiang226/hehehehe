// Snake Game with Strawberry Emoji
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDiv = document.getElementById('score');
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let snake = [{x: 10, y: 10}];
let direction = {x: 0, y: 0};
let nextDirection = {x: 0, y: 0};
let strawberry = {x: 5, y: 5};
let score = 0;
let gameOver = false;

function randomPosition() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (snake.some(segment => segment.x === pos.x && segment.y === pos.y));
  return pos;
}

function draw() {
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Draw snake as snake emojis 🐍
  ctx.font = `${gridSize}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < snake.length; i++) {
    ctx.fillText('🐍', snake[i].x * gridSize + gridSize/2, snake[i].y * gridSize + gridSize/2);
  }
  // Draw strawberry
  ctx.fillText('🍓', strawberry.x * gridSize + gridSize/2, strawberry.y * gridSize + gridSize/2);
}

function update() {
  if (gameOver) return;
  direction = nextDirection;
  if (direction.x === 0 && direction.y === 0) return; // Not started
  // Move snake
  const newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  // Check wall collision
  if (
    newHead.x < 0 || newHead.x >= tileCount ||
    newHead.y < 0 || newHead.y >= tileCount ||
    snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
  ) {
    gameOver = true;
    scoreDiv.textContent = 'Game Over! Final Score: ' + score;
    return;
  }
  snake.unshift(newHead);
  // Check strawberry
  if (newHead.x === strawberry.x && newHead.y === strawberry.y) {
    score++;
    scoreDiv.textContent = 'Score: ' + score;
    strawberry = randomPosition();
  } else {
    snake.pop();
  }
}

function gameLoop() {
  update();
  draw();
  if (!gameOver) setTimeout(gameLoop, 100);
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp' && direction.y !== 1) nextDirection = {x: 0, y: -1};
  else if (e.key === 'ArrowDown' && direction.y !== -1) nextDirection = {x: 0, y: 1};
  else if (e.key === 'ArrowLeft' && direction.x !== 1) nextDirection = {x: -1, y: 0};
  else if (e.key === 'ArrowRight' && direction.x !== -1) nextDirection = {x: 1, y: 0};
  else if (gameOver && e.key === ' ') window.location.reload();
});

draw();
gameLoop();
