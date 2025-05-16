const socket = io();

let room = 'default-room';
let player = null;

const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const usernameInput = document.getElementById('username');
const btnJoin = document.getElementById('btn-join');
const btnSkip = document.getElementById('btn-skip');
const boardEl = document.getElementById('board');
const playersEl = document.getElementById('players');
const turnEl = document.getElementById('turn');
const btnRestart = document.getElementById('btn-restart');

btnJoin.onclick = () => {
  const username = usernameInput.value.trim();
  joinGame(username);
};

btnSkip.onclick = () => {
  joinGame('');
};

function joinGame(username) {
  socket.emit('joinRoom', {room, username});
  loginScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
}

socket.on('playerData', (data) => {
  player = data;
  updatePlayersUI();
  turnEl.textContent = `Sıra: ${player.symbol === 'X' ? 'Oyuncu 1' : 'Oyuncu 2'}`;
  createBoard();
});

socket.on('updatePlayers', (players) => {
  updatePlayersUI(players);
});

socket.on('boardUpdate', (board) => {
  updateBoard(board);
});

socket.on('turnUpdate', (username) => {
  turnEl.textContent = `
