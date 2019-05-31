var express = require('express');
var bodyParser = require('body-parser');

var app = express();

var data = [{"nombre": "Mario","edad":"15", "duenios":[{"nombre":"Juan"},{"nombre":"Gregoria"}]},
	          {"nombre": "Flunfli","edad":"5", "duenios":[{"nombre":"Bautista"},{"nombre":"Maria"}]}
			];

function buscar(nombre){
	var elem = data.filter(function(elem) {
	  return elem.nombre.toLowerCase().includes(nombre.toLowerCase());
	});
	
	return elem;
}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  bodyParser.json();
  
  next();//paso el control al próximo handler (si hubiera varios en la cadena) con esta funcion
});

app.use(express.bodyParser());

app.get('/', function (req, res) {
  res.send('Bienvenido a la Tienda de Mascotas!');
});

app.get('/mascotas', function (req, res) {
	res.json(data);
});

app.get('/mascotasBuscar/:texto', function (req, res) {
	console.log(req.params.texto);
	var data = buscar(req.params.texto)
	res.json(data);
});

app.post('/mascotasGuardar', function (req, res) {
	var miMascotaNueva = req.body;
	console.log(miMascotaNueva);
});



app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

