// Space Shooter with Emoji Spaceship and UFOs
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDiv = document.getElementById('score');
const gameOverDiv = document.getElementById('gameOver');

const ship = { x: 180, y: 540, w: 40, h: 40, speed: 7 };
let bullets = [];
let ufos = [];
let score = 0;
let leftPressed = false;
let rightPressed = false;
let spacePressed = false;
let gameOver = false;
let lastBulletTime = 0;

function drawShip() {
  ctx.font = '40px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🚀', ship.x + ship.w/2, ship.y + ship.h/2);
}

function drawBullets() {
  ctx.fillStyle = '#ff0';
  bullets.forEach(bullet => {
    ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
  });
}

function drawUFOs() {
  ctx.font = '36px serif';
  ufos.forEach(ufo => {
    ctx.fillText('🛸', ufo.x + ufo.w/2, ufo.y + ufo.h/2);
  });
}

function updateBullets() {
  bullets.forEach(bullet => bullet.y -= bullet.speed);
  for (let i = bullets.length - 1; i >= 0; i--) {
    if (bullets[i].y + bullets[i].h < 0) bullets.splice(i, 1);
  }
}

function updateUFOs() {
  if (Math.random() < 0.025 + score * 0.0005) {
    ufos.push({
      x: Math.random() * (canvas.width - 40),
      y: -40,
      w: 40,
      h: 40,
      speed: 1 + Math.random() * 0.7 + score * 0.004 // slower UFOs
    });
  }
  ufos.forEach(ufo => ufo.y += ufo.speed);
  for (let i = ufos.length - 1; i >= 0; i--) {
    if (ufos[i].y > canvas.height) ufos.splice(i, 1);
  }
}

function checkCollisions() {
  // Bullet hits UFO
  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = ufos.length - 1; j >= 0; j--) {
      const b = bullets[i], u = ufos[j];
      if (
        b.x < u.x + u.w &&
        b.x + b.w > u.x &&
        b.y < u.y + u.h &&
        b.y + b.h > u.y
      ) {
        bullets.splice(i, 1);
        ufos.splice(j, 1);
        score++;
        scoreDiv.textContent = 'Score: ' + score;
        break;
      }
    }
  }
  // UFO hits ship
  for (let u of ufos) {
    if (
      ship.x < u.x + u.w &&
      ship.x + ship.w > u.x &&
      ship.y < u.y + u.h &&
      ship.y + ship.h > u.y
    ) {
      gameOver = true;
      gameOverDiv.style.display = 'block';
    }
  }
}

function loop(ts) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawShip();
  drawBullets();
  drawUFOs();
  if (!gameOver) {
    if (leftPressed && ship.x > 0) ship.x -= ship.speed;
    if (rightPressed && ship.x + ship.w < canvas.width) ship.x += ship.speed;
    if (spacePressed && ts - lastBulletTime > 120) {
      bullets.push({ x: ship.x + ship.w/2 - 3, y: ship.y - 10, w: 6, h: 18, speed: 10 });
      lastBulletTime = ts;
    }
    updateBullets();
    updateUFOs();
    checkCollisions();
    requestAnimationFrame(loop);
  }
}

document.addEventListener('keydown', function(e) {
  if (e.code === 'ArrowLeft') leftPressed = true;
  if (e.code === 'ArrowRight') rightPressed = true;
  if (e.code === 'Space') spacePressed = true;
});
document.addEventListener('keyup', function(e) {
  if (e.code === 'ArrowLeft') leftPressed = false;
  if (e.code === 'ArrowRight') rightPressed = false;
  if (e.code === 'Space') spacePressed = false;
});

requestAnimationFrame(loop);
