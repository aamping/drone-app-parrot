//module.exports = function{}
var Controller = require('./controller/controller.js');

var con = new Controller();

con.move('t');
console.log('took off');
con.move('m');
console.log('landed');
