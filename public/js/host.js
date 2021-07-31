   var socket = io();
   var r = document.querySelector(".result");

   socket.on('hello_event', () => {
      socket.emit('declare_host_event');
   });
   socket.on('update_player_list', (data) => {
   	if (data['add']) {
   		update_player_list(data);
   	} else {
   		player_disconnected(data);
   	}
   });
   
   socket.on('connect', () => { });
   
   socket.on('disconnect', () => { });

   socket.on('send_results', (data) => {
      display_results(data.results);
   });

   function update_player_list(data) {
   	( document.getElementById(data['id']) ) ? update_player(data) : add_player(data);
   }
   function update_player(data) {
   	p = document.getElementById(data['id']);
   	p.querySelector('.name').textContent = data['player'];
   }
   function add_player(data) {
   	p = document.createElement('div');
   	p.textContent = '';
      p.setAttribute("id", data['id']);
      p.classList.add('player');

      var o = document.createElement('span');
	   o.classList.add('order');

	   var n = document.createElement('span');
	   n.classList.add('name');
	   n.textContent = data['player'];

	   var t = document.createElement('span');
	   t.classList.add('time');

	   p.append(o);
	   p.append(n);
	   p.append(t);

	   r.append(p);
   }

   function player_disconnected(data) {
   	var p = document.getElementById(data['id']);
   	if ( p ) {
   		p.classList.add('disconnected');
   	}
   }
   function remove_players(data) {
   	var players = document.querySelectorAll('.player.disconnected');
      players.forEach( (e) => {
      	e.remove();
      });
   }

   function display_results(data) {
      data.forEach( (e, i) => {

   		p = document.getElementById(e['id']);

   		if (!p) { add_player(e); }

         var o = p.querySelector('.order');
         o.textContent = placement(i + 1);
      	p.setAttribute("order", i + 1);

         var t = p.querySelector('.time');
         t.textContent = "";
         var time;
         if ( i > 0 ) {
         	time = `+${time_difference( e['time'], data[0]['time'] )}s`;
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
      socket.emit('reset_buzzer_event' );
      remove_players();
   	var players = document.querySelectorAll('.player');
      players.forEach( (e) => {
      	e.removeAttribute('order');
      	e.querySelector('.order').textContent = '';
      	e.querySelector('.time').textContent = '';
      });
   }

   function time_difference(one, two) {
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

   document.querySelector("button.reset").addEventListener('mousedown', reset_clicked);
   document.querySelector("button.reset").addEventListener('touchstart', reset_clicked);