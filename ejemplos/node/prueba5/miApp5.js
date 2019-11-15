var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(function(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	  
	  next();//paso el control al próximo handler (si hubiera varios en la cadena) con esta funcion
	});


//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
//app.use(bodyParser.json());


app.get('/', function (req, res) {
  res.send('Hola mundoooooo!!');
});

function mostrarReq(req){
	var res = {"tipo":req.method, "path":req.path, "params": req.params, "body":req.body, "query":req.query};
	return res
}

//-------------------------------------------------------
app.get("/submitGET", function (req, res){
	console.log("submitGET")
	var result = mostrarReq(req);
	
	res.send(result);
});


app.post("/submitPOST", function (req, res){
	console.log("submitPOST")
	var result = mostrarReq(req);
	
	res.send(result);
});

//-------------------------------------------------------

app.get("/submitGETPosicion/:nombre/:apellido/:telefono/:equipoFavorito", function (req, res){
	console.log("submitGETPosicion")
	var result = mostrarReq(req);
	
	res.send(result);
});


app.get("/submitGETAjax", function (req, res){
	console.log("submitGETAjax")
	var result = mostrarReq(req);
	
	res.send(result);
});

function esperar(segundos) {
	var waitTill = new Date(new Date().getTime() + segundos * 1000);
	while(waitTill > new Date()){}
    console.log("continuo despues de " + segundos);
}

	

app.post("/submitPOSTAjax", function (req, res){
	console.log("submitPOSTAjax")
	var result = mostrarReq(req);
	esperar(5);
	res.send(result);
});


app.listen(3000, function () {
  console.log('App levantada en el puerto 3000!');
});