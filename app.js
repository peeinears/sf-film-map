require('dotenv').config();

var express = require('express');
var app = express();

app.use(express.static('public'));

app.listen(process.env.PORT, function () {
  console.log('Listening on port ' + process.env.PORT + '.');
});
