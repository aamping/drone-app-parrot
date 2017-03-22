var express = require('express');
var app = express();

/* GET home page.
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
*/
var send = function(app) {
  app.post('/com', function (req, res) {
  res.send('POST request to homepage');
  console.log('sent');
  return false;
});
};
