   var socket = io();

   var player_e = document.querySelector("#player");
   var host_e = document.querySelector("#host");
   var play_e = document.querySelector("#play");
   var name_e = document.querySelector("#name");
   var room_e = document.querySelector("#room");

   socket.on("connect", () => {
   	if ( !get_cookie('id') ) {
	   	set_cookie('id', socket.id, 1);
   	}
	});

	function refresh_connection() {
		socket.disconnect();
		socket.connect();
	}

   function host(e) {
    	e.preventDefault();
      socket.emit('create_room');
   }
   socket.on("host_room_response", (data) => {
   	set_cookie('room', data.room, 1);
   	window.location.href = '/host';
	});

   function play(e) {
    	e.preventDefault();
    	save_info();
    	if (name_e.value && room_e.value) {
      	socket.emit('create_player', { room: room_e.value });
    	}
   }
   socket.on("create_player_response", () => {
   	window.location.href = '/player';
	});

   function save_info() {
   	set_cookie('name', name_e.value, 1);
   	set_cookie('room', room_e.value, 1);
   }

   function load_info() {
   	name_e.value = get_cookie('name');
   	room_e.value = get_cookie('room');
   }

   load_info();

   host_e.addEventListener('click', host);
   play_e.addEventListener('click', play);
   
   name_e.addEventListener("keydown", save_info);
   name_e.addEventListener("keyup", save_info);
   name_e.addEventListener("change", save_info);
   
   room_e.addEventListener("keydown", save_info);
   room_e.addEventListener("keyup", save_info);
   room_e.addEventListener("change", save_info);