var express = require('express'),
app     = express(),
http    = require('http').createServer(app),
io      = require('socket.io')(http);

http.listen(3000);
var gameState={score: {'a':0,'b':0 },players:[], started:false};
io.on('connection', function (socket) {
    
   // console.log("Connection to Game " + socket.handshake.query['gameId'] + " established!!!");
    socket.emit('handshake', JSON.stringify(gameState));
    
    socket.on('stateChange', function (playerData) {
      gameState.players = JSON.parse(playerData);
      socket.broadcast.emit('stateChange', JSON.stringify(gameState));
    });
   
    socket.on('impactDetected', function (impactData) {
      socket.broadcast.emit('impact', JSON.stringify(impactData));
    });

    socket.on('gameStarted', function (impactData) {
      gameState.started = true;
      io.sockets.emit('stateChange', JSON.stringify(gameState));
    });
   //Arguments:  paddleData is a json encoded string e,g. {l:999,p:999}.  l is the location of the paddle on the board, p is the player id.  Both are integers.
    socket.on('paddleChange', function (paddleData) {
      socket.broadcast.emit('paddleChange', JSON.stringify(paddleData));
    });
    
    socket.on('score', function(team) {
      gameState.score[team]++;
      if (gameState.score[team] >=15) {
        gameState.started = false;
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

/*
socket.on('handshake', function (data) {
  console.log("Connection Established");
  this.onConnect();
});
socket.on('stateChange', function (stateInfo) {
  this.onUpdateState(JSON.parse(stateInfo));
});
socket.on('impact', function (impactInfo) {
  this.onImpact(JSON.parse(impactInfo));
});
socket.on('paddleChange', function (paddleInfo) {
  this.onPaddleChange(JSON.parse(paddleInfo));
});
socket.on('gameOver', function(stateInfo) {
  this.onGameOver(JSON.parse(paddleInfo))
});
*/
