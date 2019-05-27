var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/mascotas', function (req, res) {
	res.json([{"nombre": "Mario","edad":"15", "duenios":[{"nombre":"Juan"},{"nombre":"Gregoria"}]},
	          {"nombre": "Flunfli","edad":"5", "duenios":[{"nombre":"Bautista"},{"nombre":"Maria"}]}
			]);
});



app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

