var express = require('express'),
app     = express(),
http    = require('http').createServer(app),
io      = require('socket.io')(http);

http.listen(3000);
var gameState, scoreUpperBound = 15;
function initGameState() {
  gameState={score: {'a':0,'b':0 },players:[], started:false, gameId: 0};
}
initGameState();
io.on('connection', function (socket) {
    gameState.gameId = socket.handshake.query['gameId'];
   // console.log("Connection to Game " + socket.handshake.query['gameId'] + " established!!!");
    socket.emit('handshake', JSON.stringify(gameState));
    
    socket.on('stateChange', function (playerData) {
      gameState.players = JSON.parse(playerData);
      socket.broadcast.emit('stateChange', JSON.stringify(gameState));
    });
   
    socket.on('impactDetected', function (impactData) {
      socket.broadcast.emit('impact', JSON.stringify(impactData));
    });

    socket.on('gameStarted', function (data) {
      gameState.started = true;
      io.sockets.emit('stateChange', JSON.stringify(gameState));
    });
   //Arguments:  paddleData is a json encoded string e,g. {l:999,p:999}.  l is the location of the paddle on the board, p is the player id.  Both are integers.
    socket.on('paddleChange', function (paddleData) {
      socket.broadcast.emit('paddleChange', JSON.stringify(paddleData));
    });
    
    socket.on('score', function(team) {
      gameState.score[team]++;
      if (gameState.score[team] >=scoreUpperBound) {
        initGameState();
        io.sockets.emit('stateChange', JSON.stringify(gameState));
        io.sockets.emit('gameOver', JSON.stringify(gameState.score));
      } else {
        io.sockets.emit('scoreChange', JSON.stringify(gameState.score));
      }
    });    
    socket.on('disconnect', function () {
      io.emit('disconnected');
    });
});
