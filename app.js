const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const helper = require('./helpers');
const port = process.env.PORT||3000

app.use(express.static('public'));

app.get('/', function(req, res) {
   res.sendfile('index.html');
});
app.get('/player/', function(req, res) {
   res.sendfile('player.html');
});
app.get('/host/', function(req, res) {
   res.sendfile('host.html');
});

var users = {};
var connections = {};

var rooms = [ "" ];
var hosts = {};

io.on('connection', function(socket) {
   /* All Clients */
   add_to_users(socket);
   /* End All Clients */

   socket.on('disconnect', (data) => { disconnect(socket) });

   /* / Host Function */
   socket.on('create_room', (data) => { create_room(socket) });
   /* End / Host Function */

   /* / Players Function */
   socket.on('create_player', (data) => { create_player(socket, data) });
   /* End / Players Function */

   /* /host/ Host Function */
   socket.on('host_joined', (data) => { host_joined(socket) });
   socket.on('round_reset', (data) => { round_reset(socket) });
   socket.on('end_game', (data) => { end_game(socket) });
   /* End /host/ Host Function */

   /* /player/ Players Function */
   socket.on('player_joined', (data) => { player_joined(socket) });
   socket.on('player_buzzed', (data) => { player_buzzed(socket, data) });
   socket.on('send_round_results', (data) => { send_round_results(socket, data) });
   socket.on('player_connected', (data) => { player_connected(socket, data) });
   /* End /player/ Players Function */

});

/* All Clients */
function add_to_users(socket) {
   var user_info = user_obj(socket);
   user_info = (user_info) ? user_info : { 'id': socket.id }
   users[user_info['id']] = socket.id;
}
/* End All Clients */

/* / Host Function */
function create_room(socket) {
   var room = "";

   while ( room_exists(room) ) {
      room = (Math.random() + 1).toString(36).substring(7).toLowerCase();
   }

   rooms.push(room);
   socket.emit('host_room_response', {room});
}
/* End / Host Function */

/* / Players Function */
function create_player(socket, data) {
   if (room_exists(data.room)) {
      socket.emit('create_player_response');
   }
}
/* End / Players Function */

/* /host/ Host Function */
function host_joined(socket) {
   var user_info = user_obj(socket);
   remove_host(user_info['id']);

   hosts[user_info['room']] = user_info['id'];

   join_room(socket);
}
function round_reset(socket) {
   user_info = user_obj(socket);
   io.in(user_info['room']).emit('round_reset');
}
function remove_host(host) {
   if (helper.key_exists(hosts, host)) {
      delete hosts[helper.get_key_by_value(hosts, host)];
   }
}
function end_game(socket) {
   user_info = user_obj(socket);
   io.in(user_info['room']).emit('end_game');
   remove_host(user_info['id']);
}
/* End /host/ Host Function */

/* /player/ Players Function */
function player_joined(socket) {
   var user_info = user_obj(socket);
   socket.join(user_info['room']);
   if (room_exists(user_info['room'])) {
      io.in(user_info['room']).emit('update_player_list', user_info);
   } else {
      socket.emit('end_game');
   }
}
function player_buzzed(socket, data) {
   var user_info = user_obj(socket);
   user_info['time'] = data['time'];
   io.in(user_info['room']).emit('player_buzzed', user_info);
}
function send_round_results(socket, data) {
   data.forEach( (e, i) => {
      socket.to( users[e['id']] ).emit('send_round_results', {i});
   });
}
function player_connected(socket, data) {
   user_info = user_obj(socket);
   user_info['connected'] = data;
   io.in(user_info['room']).emit('player_connected', user_info);
}
/* End /player/ Players Function */

/*
function connection(socket) {
   var user_info = helper.str_obj(socket.handshake.headers.cookie);
   if (user_info['id']) {
      connections[socket.id] = user_info['id'];
   }
}
*/

function clear_room(id) {
   var key = helper.get_key_by_value(rooms, id);
}

function disconnect(socket) {
   if (is_host(socket.id)) {
      end_game(socket);
   } else {
      var user_info = user_obj(socket);
      user_info['connected'] = false;
      io.in(user_info['room']).emit('player_connected', user_info);
   }
   delete connections[socket.id];
}

/* Helper Functions */
function is_host(id) {
   return helper.key_exists(rooms, id);
}
function user_obj(socket) {
   return helper.str_obj(socket.handshake.headers.cookie);
}
function room_exists(room) {
   return ( rooms.includes(room) ) ? true : false;
}
function join_room(socket) {
   var user_info = helper.str_obj(socket.handshake.headers.cookie);
   socket.join(user_info['room']);
}
/* End Helper Functions */

http.listen(port, function() {
   console.log(`listening on localhost:${3000}`);
});