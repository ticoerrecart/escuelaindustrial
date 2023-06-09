const mariadb = require('mariadb');

const pool = mariadb.createPool({
     host: 'localhost', 
     user:'root', 
     password: 'root_pass',
     connectionLimit: 5
});

async function asyncFunction() {
    console.log("asyncFunction")
  let conn;
  try {
	conn = await pool.getConnection();
    console.log("pool");
	const rows = await conn.query("SELECT * from pedidos.usuario");
    console.log("query");
	//console.log(rows); //[ {val: 1}, meta: ... ]
    //Print list of contacts
    for (i = 0; i < rows.length; i++) {
        console.log(`${rows[i].id} ${rows[i].nombre}`);
     }
	//console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
     console.log("return")
    return Promise.resolve(1);
  } catch (err) {
	throw err;
  } finally {
	if (conn) return conn.close();
    console.log("finally")
  }
}

asyncFunction();