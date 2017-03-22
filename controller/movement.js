'use strict';

var Drone = require('../');

var ACTIVE = true;
var STEPS = 2;


function cooldown() {
  ACTIVE = false;
  setTimeout(function () {
    ACTIVE = true;
  }, STEPS * 12);
}

function init(){

  if (process.env.UUID) {
    console.log('Searching for ', process.env.UUID);
  }

  var d = new Drone(process.env.UUID); //Node.JS generates an unque ID

  d.connect(function () {
    d.setup(function () {
      console.log('Configured for Rolling Spider! ', d.name);
      d.flatTrim();
      d.startPing();
      d.flatTrim();

      // d.on('battery', function () {
      //   console.log('Battery: ' + d.status.battery + '%');
      //   d.signalStrength(function (err, val) {
      //     console.log('Signal: ' + val + 'dBm');
      //   });

      // });

      // d.on('stateChange', function () {
      //   console.log(d.status.flying ? "-- flying" : "-- down");
      // })
      setTimeout(function () {
        console.log('ready for flight');

        ACTIVE = true;
      }, 1000);
      return ('ready for flight');
    });
  });
}

function move(command){
  if (command === 'm') {
    d.emergency();
    setTimeout(function () {
      process.exit();
    }, 3000);
  } else if (command === 't') {
    console.log('takeoff');
    d.takeOff();

  } else if (command === 'w') {
    d.forward({ steps: STEPS });
    cooldown();
  } else if (command === 's') {
    d.backward({ steps: STEPS });
    cooldown();
  } else if (command === 'left') {
    d.turnLeft({ steps: STEPS });
    cooldown();
  } else if (command === 'a') {
    d.tiltLeft({ steps: STEPS });
    cooldown();
  } else if (command === 'd') {
    d.tiltRight({ steps: STEPS });
    cooldown();
  } else if (command === 'right') {
    d.turnRight({ steps: STEPS });
    cooldown();
  } else if (command === 'up') {
    d.up({ steps: STEPS * 2.5 });
    cooldown();
  } else if (command === 'down') {
    d.down({ steps: STEPS * 2.5 });
    cooldown();
  } else if (command === 'i' || command === 'f') {
    d.frontFlip({ steps: STEPS });
    cooldown();
  } else if (command === 'j') {
    d.leftFlip({ steps: STEPS });
    cooldown();
  } else if (command === 'l') {
    d.rightFlip({ steps: STEPS });
    cooldown();
  } else if (command === 'k') {
    d.backFlip({ steps: STEPS });
    cooldown();
  } else if (command === 'q') {
    console.log('Initiated Landing Sequence...');
    d.land();
//      setTimeout(function () {
//        process.exit();
//      }, 3000);
  }

function action(act){
  if (act=== 'connect'){
    return init();
  }
}

}
