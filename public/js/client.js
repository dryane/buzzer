   var sound = new Audio();
   var sound_selector = document.querySelector("select#sounds");
   var socket = io();
   var connection = document.querySelector("#connection");
   var buzzer = document.querySelector(".buzzer");
   var player_name = document.querySelector("input.name");
   var button = document.querySelector(".button");

   socket.on('hello_event', () => {
      name_changed();
   });
   
   socket.on('connect', () => { connection.checked = true });
   
   socket.on('disconnect', () => { connection.checked = false });

   socket.on('round_reset_event', () => {
      button.classList.remove("first");
      button.classList.remove("in-queue");
   });

   socket.on('send_results', (data) => {
      if (data == 1) {
         button.classList.add("first");
      } else {
         button.classList.add("in-queue");
      }
   });

   function name_changed() {
      var player = player_name.value;
      socket.emit('player_name_event', {player} );
   }

   function buzzer_clicked() {
      var time = new Date().getTime();
      socket.emit('buzzer_event', {time} );

      if (!sound.paused) { sound.currentTime = 0; }
      else { sound.play(); }
   }

   function change_buzzer() {
      sound.src = `/audio/${document.querySelector("select#sounds").value}.mp3`;
   }

   buzzer.addEventListener('mousedown', buzzer_clicked);
   buzzer.addEventListener('touchstart', buzzer_clicked);
   player_name.addEventListener('change', name_changed);
   sound_selector.addEventListener('change', change_buzzer);