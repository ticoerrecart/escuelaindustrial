var express = require('express');
var bodyParser = require('body-parser');
var mysql      = require('mysql');
var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'tico',
	  database : 'tiendademascotas'
	});



var app = express();

app.use(function(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	  
	  next();//paso el control al próximo handler (si hubiera varios en la cadena) con esta funcion
	});

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//-------------------------------------------------------------------------------------------------------------
var data = [{"id":"1","nombre": "Mario","edad":"15", "duenios":[{"nombre":"Juan"},{"nombre":"Gregoria"}]},
	          {"id":"2","nombre": "Flunfli","edad":"5", "duenios":[{"nombre":"Bautista"},{"nombre":"Maria"}]}
			];

function buscar(nombre){
	/*data.forEach(function(elem){
		console.log(elem.nombre);
	});*/
	var elem = data.filter(function(elem) {
		var nombreData = elem.nombre.toLowerCase();
		//console.log(nombreData.indexOf(nombre.toLowerCase()));
	  return nombreData.indexOf(nombre.toLowerCase())>=0;
	});
	
	return elem;
}


function testDB(res){
	//console.log("antes del connect");
	connection.connect();
	//console.log("despues del connect");
	
	
	connection.query('SELECT * FROM mascota', 
		function(err, rows, fields) {
			console.log("callback");
			var mascotas = [];
			if (err) throw err;
			  
			rows.forEach(function(elem){
				var miMascota = {};
				miMascota.id = elem.id;
				miMascota.nombre = elem.nombre;
				miMascota.edad = elem.edad;
				
				mascotas.push(miMascota);
				console.log(miMascota);
				//console.log(elem.id + "," + elem.nombre);
				
			});//end forEach
			
			console.log("mascotas:" + mascotas);
			return res.json(mascotas);
			
		}
	);

	connection.end();

}

//----------------------- mappings ---------------------------------------------------------------------------------

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
	data.push(miMascotaNueva);
	res.json({"mensaje":"Se han guardado correctamente los datos"});
});


app.get('/testDB', function (req, res) {
	  testDB(res);
	});

//----------------------- server up -------------------------------------------------------------------------------
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

