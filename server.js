var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var i = 0;
//console.log('Server!');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Drone = require('./node_modules/rolling-spider');

var txtDroneCtrl;
var d;
var busy = 0;
/**
 * Liste des utilisateurs connectés
 */
var users = [];

var SPEED = 50;
var STEPS = 25;

/**
 * Historique des messages
 */
var messages = [];

/**
 * Liste des utilisateurs en train de saisir un message
 */
var typingUsers = [];
var driver;
var msg;
var loggedUser;
var driverName;

  /**
  * Access chip to control the drone, global variable, 1=control
  */
  var allowedDroneControl = 0;

/**
* create am/pm timestamps for the begin of log messages
*/

function connectDrone(){
	console.log('connect function');
	d = new Drone('e01432623d66', 'forceConnect');
	// connecting to the drone
	d.connect(function () {
		d.setup(function () {
			console.log('Configured for Rolling Spider! ', d.name);
			d.flatTrim();
			d.startPing();
			d.flatTrim();
			setTimeout(function () {
     			console.log('ready for flight');
			sentInfo('drone', 'Ready for flight');
     			ACTIVE = true;
    			}, 1000);
		});
	});
}
function disconnectDrone(){
	d.disconnect();
	console.log('Disconnected from drone.');
	sentInfo('drone', 'Disconnected from drone');
}

function move (cmd) {
	//d.on('battery', console.log('Battery: ' + d.status.battery + '%'));
	switch (cmd) {
	    case "Forward":
              d.forward({ speed: SPEED, steps: STEPS }); 
	      break;
	    case "Leftward": 
              d.tiltLeft({ speed: SPEED, steps: STEPS }); 
	      break;
	    case "Backward": 
              d.backward({ speed: SPEED, steps: STEPS }); 
	      break;
	    case "Rightward":
              d.tiltRight({ speed: SPEED, steps: STEPS }); 
	      break;
	    case "Upward":
              d.up({ speed: SPEED, steps: STEPS }); 
	      break;
	    case "Left Turn":
              d.turnLeft({ speed: SPEED, steps: STEPS }); 
	      break;
	    case "Downward": 
              d.down({ speed: SPEED, steps: STEPS }); 
	      break;
	    case "Right Turn":
              d.turnRight({ speed: SPEED, steps: STEPS }); 
	      break;
	    case "Land":
	      d.land();
	      break;
	    case "Take Off":
	      d.takeOff();
	      break;
	    case "Emergency Land": 
	      d.emergency();
	      process.stdin.pause();
	      //process.exit();
	      break;
	    case "Flat Trim":
              d.flatTrim();
	      break;
	    default:
	      break;
	  }
}

function TimestampAMPM() {
	var dt = new Date();
	var h =  dt.getHours(), m = dt.getMinutes();
	var _time = (h > 12) ? (h-12 + ':' + m +' pm ') : (h + ':' + m +' am ');
	return _time;
}

function sentInfo (user, msg){
	var txtDroneCtrlArray = {username: user, text:msg};
	//txtDroneCtrlArray.text = txtDroneCtrl;
	io.emit('service-message', txtDroneCtrlArray);
}




app.use(bodyParser.text());
// Our root folder
app.use('/', express.static(path.join(__dirname, '/public2')));

// We will receive the command to move the drone here /move
app.post('/move',function (req, res) {
	var _time = TimestampAMPM();
	
	        console.log(_time + 'got it: ' + req.body);
		if (req.body == 'Connecting' && busy==0){
			connectDrone();
			driver=req.ip;
			driverName= loggedUser.username;
			busy=1;
			msg = req.body;
		}
		else if(req.body == 'Disconnecting' && driver==req.ip){
			disconnectDrone();
			busy=0;
			msg = req.body;
		}
		else if (driver==req.ip){
			move(req.body);
			msg = req.body;
		}
		else{
		msg= driverName + ' is already connected';
		}
		sentInfo('drone', msg);
       		res.send(null);
		

});




io.on('connection', function (socket) {

  /**
   * Utilisateur connecté à la socket
   */
  
    /**
   * Emission d'un événement "user-login" pour chaque utilisateur connecté
   */
  for (i = 0; i < users.length; i++) {
    socket.emit('user-login', users[i]);
  }
  
  /** 
   * Emission d'un événement "chat-message" pour chaque message de l'historique
   */
  for (i = 0; i < messages.length; i++) {
    if (messages[i].username !== undefined) {
      socket.emit('chat-message', messages[i]);
    } else {
      socket.emit('service-message', messages[i]);
    }
  }
  
  /**
   * Déconnexion d'un utilisateur
   */
  socket.on('disconnect', function () {
	var _time = TimestampAMPM();
	  
    if (loggedUser !== undefined) {
      // Broadcast d'un 'service-message'
      var serviceMessage = {
        text: 'User "' + loggedUser.username + '" disconnected',
        type: 'logout'
      };
      socket.broadcast.emit('service-message', serviceMessage);
      // Suppression de la liste des connectés
      var userIndex = users.indexOf(loggedUser);
      if (userIndex !== -1) {
        users.splice(userIndex, 1);
      }
      // Ajout du message à l'historique
      messages.push(serviceMessage);
      // Emission d'un 'user-logout' contenant le user
      io.emit('user-logout', loggedUser);
	  console.log(_time + 'user-logout', loggedUser);
      // Si jamais il était en train de saisir un texte, on l'enlève de la liste
      var typingUserIndex = typingUsers.indexOf(loggedUser);
      if (typingUserIndex !== -1) {
        typingUsers.splice(typingUserIndex, 1);
      }
    }
  });

  /**
   * Connexion d'un utilisateur via le formulaire :
   */
  socket.on('user-login', function (user, callback) {
	var _time = TimestampAMPM();
	  
    // Vérification que l'utilisateur n'existe pas
    var userIndex = -1;
    for (i = 0; i < users.length; i++) {
      if (users[i].username === user.username) {
        userIndex = i;
      }
    }
    if (user !== undefined && userIndex === -1) { // S'il est bien nouveau
      // Sauvegarde de l'utilisateur et ajout à la liste des connectés
      loggedUser = user;
      users.push(loggedUser);
      // Envoi et sauvegarde des messages de service
      var userServiceMessage = {
        text: 'You logged in as "' + loggedUser.username + '"',
        type: 'login'
      };
      var broadcastedServiceMessage = {
        text: 'User "' + loggedUser.username + '" logged in',
        type: 'login'
      };
      socket.emit('service-message', userServiceMessage);
      socket.broadcast.emit('service-message', broadcastedServiceMessage);
      messages.push(broadcastedServiceMessage);
      // Emission de 'user-login' et appel du callback
      io.emit('user-login', loggedUser);
	  console.log(_time + 'user-login', loggedUser);
	  
	  //first in the list of the logged user is allowed to control the drone
	  if (users.indexOf(loggedUser) === 0) 
		  {
			  allowedDroneControl = 1;
			  console.log(users.indexOf(loggedUser));
		  }
	  else
	  {
		 allowedDroneControl = 0; 
		 console.log(users.indexOf(loggedUser));
	  }
      callback(true);
    } else {
      callback(false);
    }
  });

  /**
   * Réception de l'événement 'chat-message' et réémission vers tous les utilisateurs
   */
  socket.on('chat-message', function (message) {
	  
	var _time = TimestampAMPM();
	
    // On ajoute le username au message et on émet l'événement
    message.username = loggedUser.username;
    io.emit('chat-message', message);
	console.log(_time + 'chat-message', message);
    // Sauvegarde du message
    messages.push(message);
    if (messages.length > 150) {
      messages.splice(0, 1);
    }
  });  
  
  /**
   * Réception de l'événement 'start-typing'
   * L'utilisateur commence à saisir son message
   */
  socket.on('start-typing', function () {
    // Ajout du user à la liste des utilisateurs en cours de saisie
    if (typingUsers.indexOf(loggedUser) === -1) {
      typingUsers.push(loggedUser);
    }
    io.emit('update-typing', typingUsers);
	//console.log('update-typing', typingUsers);
  });

  /**
   * Réception de l'événement 'stop-typing'
   * L'utilisateur a arrêté de saisir son message
   */
  socket.on('stop-typing', function () {
    var typingUserIndex = typingUsers.indexOf(loggedUser);
    if (typingUserIndex !== -1) {
      typingUsers.splice(typingUserIndex, 1);
    }
    io.emit('update-typing', typingUsers);
	//console.log('update-typing', typingUsers);
  });
  
  /**
  * Réception de la demande de control du drone via allowedDroneControl
  */
  
});

/**
 * Lancement du serveur en écoutant les connexions arrivant sur le port 3000
 */
http.listen(3000, function () {
  console.log('Server is listening on *:3000');
});


/*
app.listen(3000, function () {
  console.log('App listening on port 3000!')
})
*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  //next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
