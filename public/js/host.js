   var socket = io();
   var r = document.querySelector(".result");

   var room = get_cookie('room');
   var host_e = document.querySelector("#room");
   host_e.textContent = room;

   var round = [];
   var players = {};
   var players_disconnected = [];

   socket.on("connect", () => {
   	socket.emit('host_joined');
	});
   socket.on('update_player_list', (data) => {
		update_player_list(data);
   });
   socket.on("player_connected", (data) => {
   	if (!data['connected']) {
   		players_disconnected.push(data['id']);
   		player_disconnected(data['id']);
   	} else if ( players_disconnected.includes(data['id']) ) {
   		players_disconnected = delete_array_item(players_disconnected, data['id']);
   		player_reconnected(data['id']);
   	}
	});
   
   socket.on('connect', () => { });
   
   socket.on('disconnect', () => { });

   socket.on('player_buzzed', (data) => {
   	if (!players[data.id]) {
   		update_player_list(data);
   	}
   	if (!players[data.id]['buzzed']) {
      	update_results(data);
   	}
   	socket.emit('send_round_results', round);
   });

   function update_player_list(data) {
   	if ( !players[data.id] ) {
   		players[data.id] = data;
   	}
   	display_new_player( data );
   }
   function display_new_player(data) {
   	var p;
   	if ( document.getElementById(data['id']) ) {
   		p = document.getElementById(data['id']);
   		p.querySelector('.name').textContent = data['name'];
   	} else {
   	p = document.createElement('div');
   	p.textContent = '';
      p.setAttribute("id", data['id']);
      p.classList.add('player');

      var o = document.createElement('span');
	   o.classList.add('order');

	   var n = document.createElement('span');
	   n.classList.add('name');
	   n.textContent = data['name'];

	   var t = document.createElement('span');
	   t.classList.add('time');

	   p.append(o);
	   p.append(n);
	   p.append(t);
   		
   	}

	   r.append(p);
   }

   function player_disconnected(id) {
   	var p = document.getElementById(id);
   	if ( p ) {
   		p.classList.add('disconnected');
   	}
   }

   function player_reconnected(id) {
   	var p = document.getElementById(id);
   	if ( p ) {
   		p.classList.remove('disconnected');
   	}
   }
   function remove_players() {
      players_disconnected.forEach( (e) => {
      	document.getElementById(e).remove();
      	delete players[e];
      });
      players_disconnected = [];
   }

   function update_results(data) {

   	round.splice(data['time'], 0, data);
   	players[data.id]['buzzed'] = true;

      round.forEach( (e, i) => {

   		p = document.getElementById(e['id']);

   		if (!p) { display_new_player(e); }

         var o = p.querySelector('.order');
         o.textContent = placement(i + 1);
      	p.setAttribute("order", i + 1);

         var t = p.querySelector('.time');
         t.textContent = "";
         var time;
         if ( i > 0 ) {
         	time = `+${time_difference( e['time'], round[0]['time'] )}s`;
         } else {
         	time = `${read_time(e['time'])}.000s`;
         }
      	wrap_span(time, t);

      });
   }
   function wrap_span(string, e) {
		for (var i = 0; i < string.length; i++) {
			var span = document.createElement('span');
			span.textContent = string.charAt(i);
			if (string.charAt(i) == ":" || string.charAt(i) == "." ) { span.classList.add("dot"); }
			e.append(span);
		}
   }

   function placement(i) {
	   i = i.toString();

	   secondlast = i.charAt(i.length - 2);
	   last = i.charAt(i.length - 1);
	   switch (last) {
	      case '1':
	      if (secondlast == 1) return `${i}th`;
	      return `${i}st`;
	      break;

	      case '2':
	      if (secondlast == 1) return `${i}th`;
	      return `${i}nd`;
	      break;

	      case '3':
	      if (secondlast == 1) return `${i}th`;
	      return `${i}rd`;
	      break;

	      case '4':
	      case '5':
	      case '6':
	      case '7':
	      case '9':
	      case '8':
	      case '0':
	      return `${i}th`;
	      break;

	      default:
	      return i;
	   }
	}

   function reset_clicked() {
      socket.emit('round_reset' );

		for (const key in players) {
			players[key]['buzzed'] = false;
			e = document.getElementById(key);
   		e.removeAttribute('order');
      	e.querySelector('.order').textContent = '';
      	e.querySelector('.time').textContent = '';
		}
   	round = [];
      remove_players();
   }

   function time_difference(one, two) {
		if (one < two) {
			var t = two;
			two = one;
			one = t;
		}
	   var diff = one - two;
	   var msec = diff;
	   var hh = Math.floor(msec / 1000 / 60 / 60);
	   msec -= hh * 1000 * 60 * 60;
	   var mm = Math.floor(msec / 1000 / 60);
	   msec -= mm * 1000 * 60;
	   var ss = Math.floor(msec / 1000);
	   msec -= ss * 1000;
	   msec = "" + msec;
	   if (msec.length == 1) { msec += "00"; }
	   else if (msec.length == 2) { msec += "0"; }
	   diff = `${ss}.${msec}`;
	   return diff;
	}

	function read_time(time) {
	   var options = {
	     hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits :3
	   };
	   var t = new Intl.DateTimeFormat('en-AU', options).format(time);
	   t = t.split('.')[0];
	   return t;
	}

	function end_game() {
   	socket.emit('end_game');
	}

   document.querySelector(".close").addEventListener('click', end_game);

   document.querySelector("button.reset").addEventListener('mousedown', reset_clicked);
   document.querySelector("button.reset").addEventListener('touchstart', reset_clicked);