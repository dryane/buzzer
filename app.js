const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const helper = require('./helpers');

app.use(express.static('public'));

app.get('/', function(req, res) {
   res.sendfile('client.html');
});
app.get('/host/', function(req, res) {
   res.sendfile('host.html');
});

var clients = {};
var round = {};
var host;

io.on('connection', function(socket) {

   io.to(socket.id).emit('hello_event');

   socket.on('player_name_event', (data) => { player_name(data, socket.id) });

   socket.on('declare_host_event', (data) => { declare_host(socket.id); });

   socket.on('buzzer_event', (data) => { buzzer_event(data, socket.id); });

   socket.on('reset_buzzer_event', () => { reset_buzzer_event() });

   socket.on('disconnect', (data) => { update_player_list(false, socket.id, null) });
});

function player_name(data, id) {
   clients[id] = (data.player) ? data.player : id;
   update_player_list(true, id, clients[id]);
}
function update_player_list(add, id, player) {
   io.to(host).emit('update_player_list', { add, id, player} );
}

function declare_host(id) {
   host = id;
   reset_buzzer_event();
}

function buzzer_event(data, id) {
   if ( helper.key_exists(round, id) ) { return };

   round[data.time] = id;

   io.to(host).emit('send_results', return_results() );
}

function reset_buzzer_event() {
   round = {};
   io.emit('round_reset_event');
}

function return_results() {
   var results = [];
   var fastedTime = Object.keys(round)[0];
   var order = 1;
   for (const [key, value] of Object.entries(round)) {
      var result = {};
      result['player'] = clients[value];
      result['time'] = key;
      result['id'] = value;

      results.push(result);
      io.to(value).emit('send_results', order );

      order++;
   }

   return { results };
}

http.listen(3003, function() {
   console.log('listening on localhost:3003');
});