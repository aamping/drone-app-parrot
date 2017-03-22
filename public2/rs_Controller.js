'use strict';

var RollingSpider = require("rolling-spider");
var noble = require('noble');

module.exports = function(app){
  var rollingSpiders = []; // array to contain the drones
  app.post('/com',function (req, res) {
          console.log('got it:  '+req.body);
      });

     var start = function () {
      noble.startScanning(); // scan

      noble.on('discover', function(peripheral) {
        if (!Drone.isDronePeripheral(peripheral)) {
          return; // not a rolling spider
        }

        var details = {
          name: peripheral.advertisement.localName,
          uuid: peripheral.uuid,
          rssi: peripheral.rssi
        };

        rollingSpiders.push(details);
        console.log(rollingSpiders.length + ': ' + details.name + ' (' + details.uuid + '), RSSI ' + details.rssi);
      });
    }
  //Wait until the peripheral is on with the event on.('stateChange',callback)
  if (noble.state === 'poweredOn') {
    start()
  } else {
    noble.on('stateChange', start);
  }


  var move = function(move){
      switch (move) {
        case 'up':
        break;
        case 'left':

        break;
        case 'right':

        break;
        case 'down':

        break;
        default:

      }
  }

}
