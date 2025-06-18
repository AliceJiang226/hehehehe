// Flappy Bird Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDiv = document.getElementById('score');
const highScoreDiv = document.getElementById('highscore');

// Game variables
let bird = { x: 80, y: 250, w: 34, h: 24, velocity: 0, gravity: 0.5, lift: -8 };
let pipes = [];
let coins = [];
let frame = 0;
let score = 0;
let coinScore = 0;
let highScore = parseInt(localStorage.getItem('flappyHighScore')) || 0;
let gameOver = false;

// Load bird image
const birdImg = new Image();
birdImg.src = 'https://upload.wikimedia.org/wikipedia/commons/4/45/A_small_bird_in_flight.jpg';
// Load owl sticker image
const owlImg = new Image();
owlImg.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Owl_sticker.png/128px-Owl_sticker.png';

function resetGame() {
    bird.y = 250;
    bird.velocity = 0;
    pipes = [];
    coins = [];
    frame = 0;
    score = 0;
    coinScore = 0;
    gameOver = false;
    loop();
}

function drawBird() {
    // Draw bird image centered at bird.x, bird.y
    if (birdImg.complete) {
        ctx.save();
        ctx.translate(bird.x, bird.y);
        ctx.rotate(Math.min(bird.velocity / 10, 0.5));
        ctx.drawImage(birdImg, -bird.w/2, -bird.h/2, bird.w, bird.h);
        ctx.restore();
    } else {
        birdImg.onload = () => drawBird();
    }
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Draw grass hill (pipe) with gradient and shadow
        let grad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.w, 0);
        grad.addColorStop(0, '#228B22');
        grad.addColorStop(1, '#6b8e23');
        ctx.fillStyle = grad;
        ctx.shadowColor = '#222';
        ctx.shadowBlur = 8;
        // Top hill
        ctx.beginPath();
        ctx.moveTo(pipe.x, pipe.top);
        ctx.lineTo(pipe.x + pipe.w, pipe.top);
        ctx.lineTo(pipe.x + pipe.w/2, pipe.top - 30);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillRect(pipe.x, 0, pipe.w, pipe.top);
        // Bottom hill
        ctx.shadowColor = '#222';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(pipe.x, pipe.bottom);
        ctx.lineTo(pipe.x + pipe.w, pipe.bottom);
        ctx.lineTo(pipe.x + pipe.w/2, pipe.bottom + 30);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillRect(pipe.x, pipe.bottom, pipe.w, canvas.height - pipe.bottom);
    });
}

function updatePipes() {
    if (frame % 90 === 0) {
        let gap = 140;
        let top = Math.random() * (canvas.height - gap - 100) + 40;
        let pipe = {
            x: canvas.width,
            w: 52,
            top: top,
            bottom: top + gap
        };
        pipes.push(pipe);
        // Add coin in the gap
        let coinY = top + gap/2;
        coins.push({ x: canvas.width + 26, y: coinY, r: 12, collected: false });
    }
    pipes.forEach(pipe => pipe.x -= 2);
    coins.forEach(coin => coin.x -= 2);
    if (pipes.length && pipes[0].x + pipes[0].w < 0) {
        pipes.shift();
        score++;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('flappyHighScore', highScore);
        }
    }
    if (coins.length && coins[0].x + coins[0].r < 0) {
        coins.shift();
    }
}

function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            // Draw coin with shine and 3D effect
            ctx.save();
            let coinGrad = ctx.createRadialGradient(coin.x-4, coin.y-4, 2, coin.x, coin.y, coin.r);
            coinGrad.addColorStop(0, '#fffbe7');
            coinGrad.addColorStop(0.5, '#ffe066');
            coinGrad.addColorStop(1, '#e6b800');
            ctx.beginPath();
            ctx.arc(coin.x, coin.y, coin.r, 0, Math.PI*2);
            ctx.fillStyle = coinGrad;
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
            // Edge
            ctx.strokeStyle = '#ffec8b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(coin.x, coin.y, coin.r-3, 0, Math.PI*2);
            ctx.stroke();
            // Shine
            ctx.beginPath();
            ctx.arc(coin.x-3, coin.y-3, 3, 0, Math.PI);
            ctx.strokeStyle = 'rgba(255,255,255,0.7)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
        }
    });
}

function drawOwlSticker() {
    // Draw the owl sticker in the top right corner
    if (owlImg.complete) {
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.drawImage(owlImg, canvas.width - 70, 10, 60, 60);
        ctx.restore();
    } else {
        owlImg.onload = () => drawOwlSticker();
    }
}

function checkCollision() {
    if (bird.y + bird.h/2 > canvas.height || bird.y - bird.h/2 < 0) return true;
    for (let pipe of pipes) {
        if (
            bird.x + bird.w/2 > pipe.x &&
            bird.x - bird.w/2 < pipe.x + pipe.w &&
            (bird.y - bird.h/2 < pipe.top || bird.y + bird.h/2 > pipe.bottom)
        ) {
            return true;
        }
    }
    return false;
}

function checkCoinCollection() {
    coins.forEach(coin => {
        if (!coin.collected) {
            let dx = bird.x - coin.x;
            let dy = bird.y - coin.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < bird.w/2 + coin.r) {
                coin.collected = true;
                coinScore++;
            }
        }
    });
}

function drawScore() {
    scoreDiv.textContent = 'Score: ' + score + ' | Coins: ' + coinScore;
    highScoreDiv.textContent = 'High Score: ' + highScore;
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPipes();
    drawCoins();
    drawBird();
    drawOwlSticker();
    drawScore();
    if (!gameOver) {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        updatePipes();
        checkCoinCollection();
        if (checkCollision()) {
            gameOver = true;
            setTimeout(() => {
                ctx.font = '32px Arial';
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.fillText('Game Over!', canvas.width/2, canvas.height/2);
                ctx.font = '20px Arial';
                ctx.fillText('Press Space to Restart', canvas.width/2, canvas.height/2 + 40);
            }, 100);
            return;
        }
        frame++;
        requestAnimationFrame(loop);
    }
}

document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        if (gameOver) {
            resetGame();
        } else {
            bird.velocity = bird.lift;
        }
    }
});

// Start the game
resetGame();

// Runner Coin Game
const canvas2 = document.getElementById('gameCanvas');
const ctx2 = canvas2.getContext('2d');
const scoreDiv2 = document.getElementById('score');
const highScoreDiv2 = document.getElementById('highscore');

let player = { x: 60, y: 220, w: 40, h: 60, vy: 0, jump: -11, gravity: 0.6, grounded: true };
let coins2 = [];
let obstacles = [];
let groundY = 280;
let score2 = 0;
let highScore2 = parseInt(localStorage.getItem('runnerHighScore')) || 0;
let gameOver2 = false;
let frame2 = 0;

function resetGame() {
    player.y = 220;
    player.vy = 0;
    player.grounded = true;
    coins2 = [];
    obstacles = [];
    score2 = 0;
    frame2 = 0;
    gameOver2 = false;
    loop();
}

function drawPlayer() {
    ctx2.save();
    // Runner body (blue rectangle)
    ctx2.fillStyle = '#4fc3f7';
    ctx2.fillRect(player.x, player.y, player.w, player.h);
    // Head (yellow circle)
    ctx2.fillStyle = '#ffe066';
    ctx2.beginPath();
    ctx2.arc(player.x + player.w/2, player.y + 18, 16, 0, Math.PI*2);
    ctx2.fill();
    // Eye
    ctx2.fillStyle = '#222';
    ctx2.beginPath();
    ctx2.arc(player.x + player.w/2 + 6, player.y + 14, 2, 0, Math.PI*2);
    ctx2.fill();
    ctx2.restore();
}

function drawGround() {
    ctx2.fillStyle = '#228B22';
    ctx2.fillRect(0, groundY, canvas2.width, canvas2.height - groundY);
}

function drawCoins() {
    coins2.forEach(coin => {
        if (!coin.collected) {
            let grad = ctx2.createRadialGradient(coin.x-4, coin.y-4, 2, coin.x, coin.y, coin.r);
            grad.addColorStop(0, '#fffbe7');
            grad.addColorStop(0.5, '#ffe066');
            grad.addColorStop(1, '#e6b800');
            ctx2.beginPath();
            ctx2.arc(coin.x, coin.y, coin.r, 0, Math.PI*2);
            ctx2.fillStyle = grad;
            ctx2.shadowColor = '#fff';
            ctx2.shadowBlur = 8;
            ctx2.fill();
            ctx2.shadowBlur = 0;
            ctx2.strokeStyle = '#ffec8b';
            ctx2.lineWidth = 2;
            ctx2.beginPath();
            ctx2.arc(coin.x, coin.y, coin.r-3, 0, Math.PI*2);
            ctx2.stroke();
        }
    });
}

function drawObstacles() {
    ctx2.save();
    obstacles.forEach(obs => {
        ctx2.fillStyle = '#b22222';
        ctx2.fillRect(obs.x, obs.y, obs.w, obs.h);
        // Add a white skull for fun
        ctx2.fillStyle = '#fff';
        ctx2.beginPath();
        ctx2.arc(obs.x + obs.w/2, obs.y + obs.h/2, obs.w/3, 0, Math.PI*2);
        ctx2.fill();
        ctx2.fillStyle = '#222';
        ctx2.beginPath();
        ctx2.arc(obs.x + obs.w/2 - 4, obs.y + obs.h/2 - 2, 2, 0, Math.PI*2);
        ctx2.arc(obs.x + obs.w/2 + 4, obs.y + obs.h/2 - 2, 2, 0, Math.PI*2);
        ctx2.fill();
        ctx2.beginPath();
        ctx2.arc(obs.x + obs.w/2, obs.y + obs.h/2 + 4, 4, 0, Math.PI);
        ctx2.strokeStyle = '#222';
        ctx2.lineWidth = 1;
        ctx2.stroke();
    });
    ctx2.restore();
}

function updatePipes() {
    if (frame % 90 === 0) {
        let gap = 140;
        let top = Math.random() * (canvas.height - gap - 100) + 40;
        let pipe = {
            x: canvas.width,
            w: 52,
            top: top,
            bottom: top + gap
        };
        pipes.push(pipe);
        // Add coin in the gap
        let coinY = top + gap/2;
        coins.push({ x: canvas.width + 26, y: coinY, r: 12, collected: false });
    }
    pipes.forEach(pipe => pipe.x -= 2);
    coins.forEach(coin => coin.x -= 2);
    if (pipes.length && pipes[0].x + pipes[0].w < 0) {
        pipes.shift();
        score++;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('flappyHighScore', highScore);
        }
    }
    if (coins.length && coins[0].x + coins[0].r < 0) {
        coins.shift();
    }
}

function updateCoins() {
    if (frame2 % 70 === 0) {
        let y = groundY - 30 - Math.random() * 80;
        coins2.push({ x: canvas2.width + 20, y: y, r: 14, collected: false });
    }
    coins2.forEach(coin => coin.x -= 5);
    if (coins2.length && coins2[0].x + coins2[0].r < 0) {
        coins2.shift();
    }
}

function updateObstacles() {
    if (frame % 120 === 0) {
        let h = 40 + Math.random() * 40;
        obstacles.push({ x: canvas.width + 20, y: groundY - h, w: 30, h: h });
    }
    obstacles.forEach(obs => obs.x -= 5);
    if (obstacles.length && obstacles[0].x + obstacles[0].w < 0) {
        obstacles.shift();
    }
}

function checkCollision() {
    if (bird.y + bird.h/2 > canvas.height || bird.y - bird.h/2 < 0) return true;
    for (let pipe of pipes) {
        if (
            bird.x + bird.w/2 > pipe.x &&
            bird.x - bird.w/2 < pipe.x + pipe.w &&
            (bird.y - bird.h/2 < pipe.top || bird.y + bird.h/2 > pipe.bottom)
        ) {
            return true;
        }
    }
    return false;
}

function checkCoinCollection() {
    coins.forEach(coin => {
        if (!coin.collected) {
            let dx = bird.x - coin.x;
            let dy = bird.y - coin.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < bird.w/2 + coin.r) {
                coin.collected = true;
                coinScore++;
            }
        }
    });
}

function checkObstacleCollision() {
    for (let obs of obstacles) {
        if (
            player.x < obs.x + obs.w &&
            player.x + player.w > obs.x &&
            player.y < obs.y + obs.h &&
            player.y + player.h > obs.y
        ) {
            return true;
        }
    }
    return false;
}

function drawScore() {
    scoreDiv.textContent = 'Score: ' + score + ' | Coins: ' + coinScore;
    highScoreDiv.textContent = 'High Score: ' + highScore;
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPipes();
    drawCoins();
    drawBird();
    drawOwlSticker();
    drawScore();
    if (!gameOver) {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        updatePipes();
        checkCoinCollection();
        if (checkCollision()) {
            gameOver = true;
            setTimeout(() => {
                ctx.font = '32px Arial';
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.fillText('Game Over!', canvas.width/2, canvas.height/2);
                ctx.font = '20px Arial';
                ctx.fillText('Press Space to Restart', canvas.width/2, canvas.height/2 + 40);
            }, 100);
            return;
        }
        frame++;
        requestAnimationFrame(loop);
    }
}

document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        if (gameOver) {
            resetGame();
        } else {
            bird.velocity = bird.lift;
        }
    }
});

// Start the game
resetGame();

// Runner Coin Game
const canvas2 = document.getElementById('gameCanvas');
const ctx2 = canvas2.getContext('2d');
const scoreDiv2 = document.getElementById('score');
const highScoreDiv2 = document.getElementById('highscore');

let player = { x: 60, y: 220, w: 40, h: 60, vy: 0, jump: -11, gravity: 0.6, grounded: true };
let coins2 = [];
let obstacles = [];
let groundY = 280;
let score2 = 0;
let highScore2 = parseInt(localStorage.getItem('runnerHighScore')) || 0;
let gameOver2 = false;
let frame2 = 0;

function resetGame() {
    player.y = 220;
    player.vy = 0;
    player.grounded = true;
    coins2 = [];
    obstacles = [];
    score2 = 0;
    frame2 = 0;
    gameOver2 = false;
    loop();
}

function drawPlayer() {
    ctx2.save();
    // Runner body (blue rectangle)
    ctx2.fillStyle = '#4fc3f7';
    ctx2.fillRect(player.x, player.y, player.w, player.h);
    // Head (yellow circle)
    ctx2.fillStyle = '#ffe066';
    ctx2.beginPath();
    ctx2.arc(player.x + player.w/2, player.y + 18, 16, 0, Math.PI*2);
    ctx2.fill();
    // Eye
    ctx2.fillStyle = '#222';
    ctx2.beginPath();
    ctx2.arc(player.x + player.w/2 + 6, player.y + 14, 2, 0, Math.PI*2);
    ctx2.fill();
    ctx2.restore();
}

function drawGround() {
    ctx2.fillStyle = '#228B22';
    ctx2.fillRect(0, groundY, canvas2.width, canvas2.height - groundY);
}

function drawCoins() {
    coins2.forEach(coin => {
        if (!coin.collected) {
            let grad = ctx2.createRadialGradient(coin.x-4, coin.y-4, 2, coin.x, coin.y, coin.r);
            grad.addColorStop(0, '#fffbe7');
            grad.addColorStop(0.5, '#ffe066');
            grad.addColorStop(1, '#e6b800');
            ctx2.beginPath();
            ctx2.arc(coin.x, coin.y, coin.r, 0, Math.PI*2);
            ctx2.fillStyle = grad;
            ctx2.shadowColor = '#fff';
            ctx2.shadowBlur = 8;
            ctx2.fill();
            ctx2.shadowBlur = 0;
            ctx2.strokeStyle = '#ffec8b';
            ctx2.lineWidth = 2;
            ctx2.beginPath();
            ctx2.arc(coin.x, coin.y, coin.r-3, 0, Math.PI*2);
            ctx2.stroke();
        }
    });
}

function drawObstacles() {
    ctx2.save();
    obstacles.forEach(obs => {
        ctx2.fillStyle = '#b22222';
        ctx2.fillRect(obs.x, obs.y, obs.w, obs.h);
        // Add a white skull for fun
        ctx2.fillStyle = '#fff';
        ctx2.beginPath();
        ctx2.arc(obs.x + obs.w/2, obs.y + obs.h/2, obs.w/3, 0, Math.PI*2);
        ctx2.fill();
        ctx2.fillStyle = '#222';
        ctx2.beginPath();
        ctx2.arc(obs.x + obs.w/2 - 4, obs.y + obs.h/2 - 2, 2, 0, Math.PI*2);
        ctx2.arc(obs.x + obs.w/2 + 4, obs.y + obs.h/2 - 2, 2, 0, Math.PI*2);
        ctx2.fill();
        ctx2.beginPath();
        ctx2.arc(obs.x + obs.w/2, obs.y + obs.h/2 + 4, 4, 0, Math.PI);
        ctx2.strokeStyle = '#222';
        ctx2.lineWidth = 1;
        ctx2.stroke();
    });
    ctx2.restore();
}

function updatePipes() {
    if (frame % 90 === 0) {
        let gap = 140;
        let top = Math.random() * (canvas.height - gap - 100) + 40;
        let pipe = {
            x: canvas.width,
            w: 52,
            top: top,
            bottom: top + gap
        };
        pipes.push(pipe);
        // Add coin in the gap
        let coinY = top + gap/2;
        coins.push({ x: canvas.width + 26, y: coinY, r: 12, collected: false });
    }
    pipes.forEach(pipe => pipe.x -= 2);
    coins.forEach(coin => coin.x -= 2);
    if (pipes.length && pipes[0].x + pipes[0].w < 0) {
        pipes.shift();
        score++;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('flappyHighScore', highScore);
        }
    }
    if (coins.length && coins[0].x + coins[0].r < 0) {
        coins.shift();
    }
}

function updateCoins() {
    if (frame2 % 70 === 0) {
        let y = groundY - 30 - Math.random() * 80;
        coins2.push({ x: canvas2.width + 20, y: y, r: 14, collected: false });
    }
    coins2.forEach(coin => coin.x -= 5);
    if (coins2.length && coins2[0].x + coins2[0].r < 0) {
        coins2.shift();
    }
}

function updateObstacles() {
    if (frame % 120 === 0) {
        let h = 40 + Math.random() * 40;
        obstacles.push({ x: canvas.width + 20, y: groundY - h, w: 30, h: h });
    }
    obstacles.forEach(obs => obs.x -= 5);
    if (obstacles.length && obstacles[0].x + obstacles[0].w < 0) {
        obstacles.shift();
    }
}

function checkCollision() {
    if (bird.y + bird.h/2 > canvas.height || bird.y - bird.h/2 < 0) return true;
    for (let pipe of pipes) {
        if (
            bird.x + bird.w/2 > pipe.x &&
            bird.x - bird.w/2 < pipe.x + pipe.w &&
            (bird.y - bird.h/2 < pipe.top || bird.y + bird.h/2 > pipe.bottom)
        ) {
            return true;
        }
    }
    return false;
}

function checkCoinCollection() {
    coins.forEach(coin => {
        if (!coin.collected) {
            let dx = bird.x - coin.x;
            let dy = bird.y - coin.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < bird.w/2 + coin.r) {
                coin.collected = true;
                coinScore++;
            }
        }
    });
}

function checkObstacleCollision() {
    for (let obs of obstacles) {
        if (
            player.x < obs.x + obs.w &&
            player.x + player.w > obs.x &&
            player.y < obs.y + obs.h &&
            player.y + player.h > obs.y
        ) {
            return true;
        }
    }
    return false;
}

function drawScore() {
    scoreDiv2.textContent = 'Score: ' + score2;
    highScoreDiv2.textContent = 'High Score: ' + highScore2;
}

function loop() {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    drawGround();
    drawCoins();
    drawObstacles();
    drawPlayer();
    drawScore();
    if (!gameOver2) {
        // Player physics
        player.vy += player.gravity;
        player.y += player.vy;
        if (player.y + player.h >= groundY) {
            player.y = groundY - player.h;
            player.vy = 0;
            player.grounded = true;
        } else {
            player.grounded = false;
        }
        updateCoins();
        updateObstacles();
        checkCoinCollection();
        if (checkObstacleCollision()) {
            gameOver2 = true;
        }
        frame2++;
        requestAnimationFrame(loop);
    } else {
        ctx2.font = '32px Arial';
        ctx2.fillStyle = '#fff';
        ctx2.textAlign = 'center';
        ctx2.fillText('Game Over!', canvas2.width/2, canvas2.height/2);
        ctx2.font = '20px Arial';
        ctx2.fillText('Press Space to Restart', canvas2.width/2, canvas2.height/2 + 40);
    }
}

document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        if (gameOver2) {
            resetGame();
        } else if (player.grounded) {
            player.vy = player.jump;
        }
    }
});

resetGame();
