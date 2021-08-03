   var sound = new Audio();
   var sound_selector = document.querySelector("select#sounds");
   var socket = io();
   var connection = document.querySelector("#connection");
   var buzzer = document.querySelector(".buzzer");
   var player_name = document.querySelector("input.name");
   var button = document.querySelector(".button");
   var body = document.querySelector("body");

   var name = get_cookie('name');
   var name_e = document.querySelector("#name");
   name_e.textContent = name;

   socket.on("connect", () => {
      socket.emit('player_joined');
   });

   socket.on("end_game", () => {
      delete_cookie('room');
      window.location.href = '/';
   });
   
   socket.on('connect', () => {
      connection.checked = true;
      socket.emit('player_connected', true);
   });
   
   socket.on('disconnect', () => {
      connection.checked = false;
   });

   socket.on('round_reset', () => {
      body.classList.remove("first");
      body.classList.remove("in-queue");
   });

   socket.on('send_round_results', (data) => {
      if (data['i'] == 0) {
         body.classList.add("first");
      } else {
         body.classList.add("in-queue");
      }
   });

   function name_changed() {
      var player = player_name.value;
      socket.emit('player_name_event', {player} );
   }

   function buzzer_clicked() {
      var time = new Date().getTime();
      socket.emit('player_buzzed', {time} );

      if (!sound.paused) { sound.currentTime = 0; }
      else { sound.play(); }
   }

   function change_buzzer() {
      sound.src = `/audio/${document.querySelector("select#sounds").value}.mp3`;
   }

   buzzer.addEventListener('mousedown', buzzer_clicked);
   buzzer.addEventListener('touchstart', buzzer_clicked);
   sound_selector.addEventListener('change', change_buzzer);