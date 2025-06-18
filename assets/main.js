// Space Shooter Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDiv = document.getElementById('score');

let spaceship = { x: canvas.width/2 - 25, y: canvas.height - 70, w: 50, h: 50, speed: 7 };
let bullets = [];
let aliens = [];
let score = 0;
let leftPressed = false;
let rightPressed = false;
let level = 1;
let aliensPerLevel = 5;
let levelUpScore = 50;

function drawSpaceship() {
  ctx.save();
  ctx.translate(spaceship.x + spaceship.w/2, spaceship.y + spaceship.h/2);
  ctx.rotate(0);
  // Main body (gradient metallic)
  let bodyGrad = ctx.createLinearGradient(-20, 0, 20, 0);
  bodyGrad.addColorStop(0, '#b0c4de');
  bodyGrad.addColorStop(0.5, '#fff');
  bodyGrad.addColorStop(1, '#b0c4de');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(0, -25); // nose
  ctx.lineTo(18, 25); // right wing tip
  ctx.lineTo(10, 18); // right body
  ctx.lineTo(-10, 18); // left body
  ctx.lineTo(-18, 25); // left wing tip
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Cockpit (glass dome)
  let cockpitGrad = ctx.createRadialGradient(0, -8, 2, 0, 0, 12);
  cockpitGrad.addColorStop(0, '#e0f7fa');
  cockpitGrad.addColorStop(1, '#1976d2');
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.ellipse(0, -5, 8, 12, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = '#1976d2';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Engine (bottom)
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(0, 25, 7, 5, 0, 0, Math.PI*2);
  ctx.fill();
  // Engine glow
  let flameGrad = ctx.createRadialGradient(0, 32, 2, 0, 32, 12);
  flameGrad.addColorStop(0, 'rgba(255,255,0,0.8)');
  flameGrad.addColorStop(0.5, 'rgba(255,140,0,0.7)');
  flameGrad.addColorStop(1, 'rgba(255,69,0,0.2)');
  ctx.beginPath();
  ctx.ellipse(0, 32, 7, 12, 0, 0, Math.PI*2);
  ctx.fillStyle = flameGrad;
  ctx.fill();
  // Fuselage details
  ctx.strokeStyle = '#aaa';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-5, -10); ctx.lineTo(-5, 18);
  ctx.moveTo(5, -10); ctx.lineTo(5, 18);
  ctx.stroke();
  // Windows
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-4, 2, 2, 0, Math.PI*2);
  ctx.arc(4, 2, 2, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawBullets() {
  ctx.fillStyle = '#ff0';
  bullets.forEach(bullet => {
    ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
  });
}

function updateBullets() {
  bullets.forEach(bullet => bullet.y -= bullet.speed);
  // Remove off-screen bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    if (bullets[i].y + bullets[i].h < 0) bullets.splice(i, 1);
  }
}

function resetAliens() {
  aliens = [];
  for (let i = 0; i < aliensPerLevel; i++) {
    aliens.push({
      x: 40 + i * (canvas.width - 80) / (aliensPerLevel - 1),
      y: 60 + Math.random() * 40,
      w: 48,
      h: 32,
      dx: 2 + Math.random() * (1.5 + level * 0.3),
      dy: 0.7 + Math.random() * (0.7 + level * 0.2),
      phase: Math.random() * Math.PI * 2,
      alive: true
    });
  }
}

function drawAlien(alien) {
  ctx.save();
  ctx.translate(alien.x + alien.w/2, alien.y + alien.h/2);
  // Body (gradient)
  let grad = ctx.createLinearGradient(-24, 0, 24, 0);
  grad.addColorStop(0, '#8e44ad');
  grad.addColorStop(0.5, '#fff');
  grad.addColorStop(1, '#16a085');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 14, 0, 0, Math.PI*2);
  ctx.fill();
  // Dome
  ctx.fillStyle = 'rgba(0,255,255,0.7)';
  ctx.beginPath();
  ctx.ellipse(0, -6, 16, 8, 0, 0, Math.PI*2);
  ctx.fill();
  // Lights
  for (let i = -16; i <= 16; i += 8) {
    ctx.fillStyle = '#ff0';
    ctx.beginPath();
    ctx.arc(i, 12, 3, 0, Math.PI*2);
    ctx.fill();
  }
  // Antenna
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(0, -22);
  ctx.stroke();
  ctx.fillStyle = '#ff0';
  ctx.beginPath();
  ctx.arc(0, -22, 2, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawAliens() {
  aliens.forEach(alien => {
    if (alien.alive) drawAlien(alien);
  });
}

function updateAliens() {
  aliens.forEach(alien => {
    if (!alien.alive) return;
    alien.x += Math.sin(performance.now()/500 + alien.phase) * alien.dx;
    alien.y += Math.cos(performance.now()/700 + alien.phase) * alien.dy;
    // Bounce off walls
    if (alien.x < 0) alien.x = 0;
    if (alien.x + alien.w > canvas.width) alien.x = canvas.width - alien.w;
    if (alien.y < 0) alien.y = 0;
    if (alien.y + alien.h > canvas.height/2) alien.y = canvas.height/2 - alien.h;
  });
}

function checkBulletAlienCollision() {
  bullets.forEach(bullet => {
    aliens.forEach(alien => {
      if (
        alien.alive &&
        bullet.x < alien.x + alien.w &&
        bullet.x + bullet.w > alien.x &&
        bullet.y < alien.y + alien.h &&
        bullet.y + bullet.h > alien.y
      ) {
        alien.alive = false;
        bullet.y = -1000; // move bullet off screen
        score += 10;
      }
    });
  });
}

function drawScore() {
  scoreDiv.textContent = 'Score: ' + score;
}

function drawLevel() {
  ctx.save();
  ctx.font = '20px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'right';
  ctx.fillText('Level: ' + level, canvas.width - 20, 30);
  ctx.restore();
}

function checkLevelUp() {
  // Level up every levelUpScore points
  if (score >= level * levelUpScore) {
    level++;
    aliensPerLevel = 5 + (level - 1) * 2;
    resetAliens();
  }
  // If all aliens are dead, go to next level
  if (aliens.every(a => !a.alive)) {
    level++;
    aliensPerLevel = 5 + (level - 1) * 2;
    resetAliens();
  }
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSpaceship();
  drawBullets();
  drawAliens();
  drawScore();
  drawLevel();
  if (leftPressed && spaceship.x > 0) {
    spaceship.x -= spaceship.speed;
  }
  if (rightPressed && spaceship.x + spaceship.w < canvas.width) {
    spaceship.x += spaceship.speed;
  }
  updateBullets();
  updateAliens();
  checkBulletAlienCollision();
  checkLevelUp();
  requestAnimationFrame(loop);
}

document.addEventListener('keydown', function(e) {
  if (e.code === 'ArrowLeft') leftPressed = true;
  if (e.code === 'ArrowRight') rightPressed = true;
  if (e.code === 'Space') {
    // Shoot bullet
    bullets.push({
      x: spaceship.x + spaceship.w/2 - 3,
      y: spaceship.y - 10,
      w: 6,
      h: 18,
      speed: 10
    });
  }
});
document.addEventListener('keyup', function(e) {
  if (e.code === 'ArrowLeft') leftPressed = false;
  if (e.code === 'ArrowRight') rightPressed = false;
});

// On game start, reset level and aliens
level = 1;
aliensPerLevel = 5;
resetAliens();

loop();
