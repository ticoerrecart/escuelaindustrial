
let express = require('express');

let miApp = express();
//indica en que carpeta esta el contenido estatico html
miApp.use(express.static("html"));

//indica en que carpeta esta el contenido dinamico (.ejs)
miApp.set("view engine", "ejs");

//para poder parsear lo que enviamos con un form desde html
miApp.use(express.json());
miApp.use(express.urlencoded({ extended: true }));

//----------------------------------------------
//configuracion de session
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

const oneDay = 1000 * 60 * 60 * 24;
miApp.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));
// cookie parser middleware
miApp.use(cookieParser());

//----------------------------------------------
//configuracion de base de datos con MySQL
/*const mysql = require('mysql');

//con xampp los chicos usan MariaDB 10.4.24 en vez de MySQL
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root_pass",
  database : "pedidos"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
*/
//---------------------------------------------- 
const mariadb = require('mariadb');

const pool = mariadb.createPool({
     host: 'localhost', 
     user:'root', 
     password: 'root_pass',
     connectionLimit: 5
});

//----------------------------------------------
async function insertRow (nombre="juan") {
  
    let query = `INSERT INTO pedidos.usuario (nombre) VALUES (?);`;
    try{
        conn = await pool.getConnection();
    
        const rows = await conn.query(query, [nombre]);
    
    } catch (err) {
        throw err;
    } finally {
         // Close Connection
      if (conn) conn.end();
    }
};

async function recuperarProfesores() {
    //console.log("asyncFunction")
  let conn;
  try {
	conn = await pool.getConnection();
    //console.log("pool");
	const rows = await conn.query("select Id, Nombre , Apellido from retiros.Profesores");
    //console.log("query");
    return rows;
  } catch (err) {
	throw err;
  } finally {
	 // Close Connection
   if (conn) conn.end();
  }
}


async function recuperarAulas() {
    //console.log("asyncFunction")
  let conn;
  try {
	conn = await pool.getConnection();
    //console.log("pool");
	const rows = await conn.query("select Id, Nombre from retiros.Aulas");
    //console.log("query");
    return rows;
  } catch (err) {
	throw err;
  } finally {
	 // Close Connection
   if (conn) conn.end();
  }
}

async function recuperarUsuarios() {
    //console.log("asyncFunction")
  let conn;
  try {
	conn = await pool.getConnection();
    //console.log("pool");
	const rows = await conn.query("SELECT * from pedidos.usuario");
    //console.log("query");
	//console.log(rows); //[ {val: 1}, meta: ... ]
    //Print list of contacts
    for (i = 0; i < rows.length; i++) {
        console.log(`${rows[i].id} ${rows[i].nombre}`);
     }
	//console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
     //console.log("return")
    //return Promise.resolve(rows);
    return rows;
  } catch (err) {
	throw err;
  } finally {
	 // Close Connection
   if (conn) conn.end();
  }
}


async function recuperarObjetos() {
  let conn;
  try {
	conn = await pool.getConnection();
    //console.log("pool");
	const rows = await conn.query("select Id, Codigo, Descripcion, Tipo from retiros.ObjetoARetirar");
    //console.log("query");
    return rows;
  } catch (err) {
	throw err;
  } finally {
	 // Close Connection
   if (conn) conn.end();
  }
}

miApp.get("/usuarios", async function (pedido,respuesta){
    const usuarios = await recuperarUsuarios();
    console.log("usuarios en /usuarios");
    for (i = 0; i < usuarios.length; i++) {
        console.log(`${usuarios[i].id} ${usuarios[i].nombre}`);
     }
    respuesta.render("usuarios", {usuarios:usuarios});
});


miApp.get("/profesores", async function (pedido,respuesta){
    const profesores = await recuperarProfesores();
    console.log("profesores en /profesores");
    for (i = 0; i < profesores.length; i++) {
        console.log(`${profesores[i].id} ${profesores[i].Nombre} ${profesores[i].Apellido}`);
     }
    respuesta.render("profesores", {profesores:profesores});
});

miApp.get("/insertRow/:usuario", async function (pedido,respuesta){
    const usuario = pedido.params.usuario;
    console.log(usuario);
    await insertRow(usuario);
    return respuesta.send("OK");
});
//----------------------------------------------------------------------
 
function usuarioLogueado(pedido){
    return(pedido.session && pedido.session.usuarioLogueado);
 }
  
 miApp.listen(3000, function () {
    console.log("servidor levantado!!");
 });
  
 miApp.get("/", function (pedido,respuesta){
    let miSesion = pedido.session;
    //console.log("miSesion",miSesion);
    if(!usuarioLogueado(pedido)){
        respuesta.redirect("/login");
    }else{
        return respuesta.send("<H1>Bienvenido</H1>");
    }
    //listarPersonasHome(respuesta, miSesion);
 });
  
 miApp.get("/login", function (pedido,respuesta){
    let miSesion = pedido.session;
    //console.log("miSesion",miSesion);
    respuesta.render("login");
    //listarPersonasHome(respuesta, miSesion);
 });
  
 miApp.post("/ingresar", async function (pedido,respuesta){
   //validar usuario y pass y si esta OK, continuar!
   const profesores = await recuperarProfesores();
   const aulas = await recuperarAulas();
   const objetos = await recuperarObjetos();
   
   const datos = {
    profesores:profesores,
    aulas:aulas,
    objetos:objetos
   }   
   respuesta.render("retirar", datos);
 });
 
 
 miApp.post("/retirar", async function (pedido,respuesta){
  //validar usuario y pass y si esta OK, continuar!
  const objetosPedidos = pedido.body;
  console.log(objetosPedidos);
  const profesores = await recuperarProfesores();
  const aulas = await recuperarAulas();
  const objetos = await recuperarObjetos();
  
  const datos = {
   profesores:profesores,
   aulas:aulas,
   objetos:objetos
  }   
  respuesta.render("retirar", datos);
});
