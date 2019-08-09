var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hola mundo!!');
});

/*
 * .app	holds a reference to the Express app object
.baseUrl	the base path on which the app responds
.body	contains the data submitted in the request body (must be parsed and populated manually before you can access it)
.cookies	contains the cookies sent by the request (needs the cookie-parser middleware)
.hostname	the hostname as defined in the Host HTTP header value
.ip	the client IP
.method	the HTTP method used
.params	the route named parameters
.path	the URL path
.protocol	the request protocol
.query	an object containing all the query strings used in the request
.secure	true if the request is secure (uses HTTPS)
.signedCookies	contains the signed cookies sent by the request (needs the cookie-parser middleware)
.xhr	true if the request is an XMLHttpRequest
 */
app.get('/info', function (req, res) {
	var salida = {};
	
	console.log(app);
	
	salida.baseUrl = req.baseUrl;
	salida.body = req.body;

	salida.hostname=req.hostname;
	
	salida.ip=req.ip;
	
	salida.method=req.method;
	
	salida.params = req.params;
	
	salida.path = req.path;
	
	salida.protocol = req.protocol;
	
	salida.query = req.query;
	
	salida.secure= req.secure;
	
	salida.signedCookies = req.signedCookies;
	
	salida.xhr = req.xhr;
	
	
	console.log(salida);
	res.json(salida);
});

app.get("/json", function (req, res){
	var result = {"prueba":"valor1"}; 
	res.send(result);
});

app.get("/json2", function (req, res){
	var result = {"prueba2":"valor2"}; 
	res.json(result);
});


app.listen(3000, function () {
  console.log('App levantada en el puerto 3000!');
});