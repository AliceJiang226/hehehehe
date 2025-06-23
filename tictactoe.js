// Tic Tac Toe Game: Human (O) vs Bot (X)
const boardDiv = document.getElementById('board');
const statusDiv = document.getElementById('status');
const restartBtn = document.getElementById('restart');
let board, gameOver, turn;

function init() {
  board = Array(9).fill(null); // 0-8
  gameOver = false;
  turn = 'O'; // Human always starts
  render();
  statusDiv.textContent = "Your turn (O)";
  restartBtn.style.display = 'none';
}

function render() {
  boardDiv.innerHTML = '';
  board.forEach((cell, i) => {
    const div = document.createElement('div');
    div.className = 'cell';
    div.dataset.idx = i;
    if (cell === 'O') div.innerHTML = '<span style="color:#fff;">◯</span>';
    else if (cell === 'X') div.innerHTML = '<span style="color:#fff;">✕</span>';
    div.onclick = () => handleClick(i);
    boardDiv.appendChild(div);
  });
}

function handleClick(idx) {
  if (gameOver || board[idx]) return;
  if (turn !== 'O') return;
  board[idx] = 'O';
  render();
  if (checkWin('O')) {
    statusDiv.textContent = 'You win!';
    gameOver = true;
    restartBtn.style.display = 'inline-block';
    return;
  }
  if (board.every(cell => cell)) {
    statusDiv.textContent = "It's a draw!";
    gameOver = true;
    restartBtn.style.display = 'inline-block';
    return;
  }
  turn = 'X';
  statusDiv.textContent = "Bot's turn (✕)";
  setTimeout(botMove, 500);
}

function botMove() {
  // Simple AI: win > block > random
  let move = findBestMove('X') || findBestMove('O') || randomMove();
  board[move] = 'X';
  render();
  if (checkWin('X')) {
    statusDiv.textContent = 'Bot wins!';
    gameOver = true;
    restartBtn.style.display = 'inline-block';
    return;
  }
  if (board.every(cell => cell)) {
    statusDiv.textContent = "It's a draw!";
    gameOver = true;
    restartBtn.style.display = 'inline-block';
    return;
  }
  turn = 'O';
  statusDiv.textContent = "Your turn (O)";
}

function findBestMove(player) {
  // Try to win/block
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = player;
      if (checkWin(player)) {
        board[i] = null;
        return i;
      }
      board[i] = null;
    }
  }
  return null;
}

function randomMove() {
  const empty = board.map((v, i) => v ? null : i).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function checkWin(player) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6]          // diags
  ];
  return wins.some(line => line.every(i => board[i] === player));
}

restartBtn.onclick = init;

init();
