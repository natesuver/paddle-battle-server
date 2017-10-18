var express = require('express'),
app     = express(),
http    = require('http').createServer(app),
io      = require('socket.io')(http);

http.listen(3000);

io.on('connection', function (socket) {
  socket.emit('handshake', {status : 'welcome'});

  socket.on('paddlemove', function (data) {
    //socket.broadcast.emit('loc', data);
    socket.emit('loc', data);
   // io.emit('test response', {
    //    success  : true,
    //    received : data
    //});
  });
});