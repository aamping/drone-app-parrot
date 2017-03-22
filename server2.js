var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var i = 0;
console.log('Server!');

var Drone = require('/home/pi/node_modules/rolling-spider/lib/drone');
var d = new Drone('RS_B200011');

// connecting to the drone
d.connect(function () {
  d.setup(function () {
  d.flatTrim();
  d.startPing();
  d.flatTrim();
  });
});

// displaying battery and signal
d.on('battery', function () {
  console.log('Battery: ' + d.status.battery + '%');
//  d.signalStrength(function (err, val) {
//    console.log('Signal: ' + val + 'dBm');
//  });
});


var SPEED = 50;
var STEPS = 25;


// We will create our server using the library ExpressJS
var app = express();

// We set what kind of data we will send from the client-server
var app = express()
//var rolling_spider = require('./public2/rs_Controller.js')
//rolling_spider(app);
// app.use(bodyParser.json());
app.use(bodyParser.text());

// Our root folder
app.use('/', express.static(path.join(__dirname, '/public2')));

// We will receive the command to move the drone here /move
app.post('/move',function (req, res) {
        console.log(req.body);
        res.send(null);

// using Case Switch
	  switch (req.body) {
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

    });
app.post('/information', function (req, res){
        console.log('sending info');
        res.send('whatever: 1');
})




app.listen(3000, function () {
  console.log('App listening on port 3000!')
})

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
