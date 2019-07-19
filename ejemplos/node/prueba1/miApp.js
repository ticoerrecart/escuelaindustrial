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
	  res.header("Access-Control-Allow-Headers", "*");
	  
	  next();//paso el control al próximo handler (si hubiera varios en la cadena) con esta funcion
	});

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//-------------------------------------------------------------------------------------------------------------
/*var data = [{"id":"1","nombre": "Mario","edad":"15", "duenios":[{"nombre":"Juan"},{"nombre":"Gregoria"}]},
	          {"id":"2","nombre": "Flunfli","edad":"5", "duenios":[{"nombre":"Bautista"},{"nombre":"Maria"}]}
			];
*/

function buscar(res, nombre){
	
	connection.query('SELECT * FROM mascota WHERE nombre like ?',
			["%" + nombre + "%"],		
		function(err, rows, fields) {
			console.log("callback");
			var mascotas = [];
			if (err) throw err;
			if(rows.length==0){
				console.log("No hay mascotas");
			}
			
			rows.forEach(function(elem){
				var miMascota = {};
				miMascota.id = elem.id;
				miMascota.nombre = elem.nombre;
				miMascota.edad = elem.edad;
				
				mascotas.push(miMascota);
				//console.log(miMascota);
				//console.log(elem.id + "," + elem.nombre);
				
			});//end forEach
			
			console.log("mascotas:" + mascotas);
			return res.json(mascotas);
			
		}
	);
	
}


function listadoMascotas(res){
	
	connection.query('SELECT * FROM mascota', 
		function(err, rows, fields) {
			console.log("callback");
			var mascotas = [];
			if (err) throw err;
			if(rows.length==0){
				console.log("No hay mascotas");
			}else{  
				rows.forEach(function(elem){
					var miMascota = {};
					miMascota.id = elem.id;
					miMascota.nombre = elem.nombre;
					miMascota.edad = elem.edad;
					
					mascotas.push(miMascota);
					//console.log(miMascota);
					//console.log(elem.id + "," + elem.nombre);
					
				});//end forEach

			}
			
			console.log("mascotas:" + mascotas);
			return res.json(mascotas);
			
		}
	);
	
}

function maxId(connection){
	var max=1;
	
	connection.query('SELECT max(id) id FROM mascota', 
		function(err, rows, fields) {
			console.log("callback");
			if (err) throw err;
			  
			rows.forEach(function(elem){
				console.log(elem);
				console.log(elem.id);
				if(elem.id>1){
					max=elem.id;
				}
				
			});//end forEach
			
			//return max;
			
		}
	);
	
	//return max;
}

function guardar(mascota){
	
	connection.query('INSERT INTO mascota (nombre, edad) VALUES (?, ?)', 
			[mascota.nombre, mascota.edad],
		function(err, rows, fields) {
			console.log("callback");
			if (err) throw err;
			  
			//console.log("alta mascotas:" + mascotas);
		}
	);
	
}



//----------------------- mappings ---------------------------------------------------------------------------------

app.get('/', function (req, res) {
  res.send('Bienvenido a la Tienda de Mascotas!');
});

app.get('/mascotas', function (req, res) {
	listadoMascotas(res);
});

app.get('/mascotasBuscar/:texto', function (req, res) {
	console.log("mascotasBuscar/")
	console.log(req.params.texto);
	buscar(res, req.params.texto);
});

app.post('/mascotasGuardar', function (req, res) {
	var miMascotaNueva = req.body;
	console.log(miMascotaNueva);
	if(miMascotaNueva.nombre=="" || miMascotaNueva.edad==""){
		res.json({"mensaje":"Debe completar el nombre y la edad de la mascota"});
	}else{
		guardar(miMascotaNueva);
		res.json({"mensaje":"Se han guardado correctamente los datos"});
	}
});

app.get('/maxId', function (req, res) {
	connection.connect();
	maxId(connection);
	res.json({"mensaje":"nuevo id en consola"});
});

//----------------------- server up -------------------------------------------------------------------------------
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

