const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

let rooms = {};

io.on('connection', (socket) => {
  console.log('Bir kullanıcı bağlandı: ' + socket.id);

  socket.on('joinRoom', ({room, username}) => {
    socket.join(room);
    if (!rooms[room]) rooms[room] = {players: [], board: Array(9).fill(null), turn: 0};
    
    if (rooms[room].players.length < 2) {
      rooms[room].players.push({id: socket.id, username: username || `Oyuncu ${rooms[room].players.length + 1}`, symbol: rooms[room].players.length === 0 ? 'X' : 'O'});
      socket.emit('playerData', rooms[room].players[rooms[room].players.length -1]);
      io.to(room).emit('updatePlayers', rooms[room].players);
    } else {
      socket.emit('roomFull');
    }
  });

  socket.on('makeMove', ({room, index}) => {
    const game = rooms[room];
    if (!game) return;
    if (game.board[index] || game.players[game.turn].id !== socket.id) return;

    game.board[index] = game.players[game.turn].symbol;
    game.turn = 1 - game.turn;
    io.to(room).emit('boardUpdate', game.board);
    io.to(room).emit('turnUpdate', game.players[game.turn].username);
  });

  socket.on('disconnect', () => {
    // Bağlantı kesilme durumu eklenebilir
  });
});

http.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});
