import db from '$lib/db.js'; //importamos nuestra configuracion de base de datos

//operaciones segun el tipo de consulta SQL:
// SELECT sin parametros=> all()
// SELECT con parametros=> get(parametros)
// INSERT, UPDATE, DELETE =>run()

//GET PARA LISTAR
export async function GET() {
	const stmt = db.prepare('SELECT id,nombre,descripcion,categoria,disponible,fecha_creacion FROM objetos');
	const objetosBD = stmt.all(); //usamos stmt.all() para un SELECT sin parametros]*/
	console.log(objetosBD);

	const stmt2 = db.prepare('SELECT count(*) FROM objetos');
	const cantBD = stmt2.all(); //usamos stmt.all() para un SELECT sin parametros]*/
	console.log(cantBD);

	return new Response(JSON.stringify(objetosBD), {
		headers: { 'Content-Type': 'application/json' }
	});
}

//POST PARA GUARDAR
export async function POST({ request }) {
	const body = await request.json();
	console.log('body', body);

	const nombre = body.nombre;
	const descripcion = body.descripcion;
	const categoria = body.categoria;
	const disponible = body.disponible;
	
	if (!nombre || !categoria) {
		return new Response(JSON.stringify({ error: 'Nombre y categoria son requeridos' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Check if name already exists (case-insensitive)
	//usamos st
	const stmsBusqueda = db.prepare('SELECT 1 FROM objetos WHERE nombre = ? AND categoria = ? ');
	const exists = stmsBusqueda.get(nombre, categoria); //usamos stmt.get para un SELECT con parametros

	if (exists) {
		return new Response(JSON.stringify({ error: 'El objeto en esta categoria ya existe' }), {
			status: 409,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const stmt = db.prepare('INSERT INTO objetos (nombre, categoria) VALUES (?, ?)');
	stmt.run(nombre.trim(), categoria.trim()); //usamos stmt.run para un INSERT, DELETE,UPDATE

	const objetos = db.prepare('SELECT id, nombre, descripcion, categoria, disponible, fecha_creacion FROM objetos').all();

	return new Response(
		JSON.stringify({
			success: true,
			objetos 
		}),
		{
			headers: { 'Content-Type': 'application/json' }
		}
	);
}

//DELETE PARA BORRAR
export async function DELETE({ request }) {
	const { id } = await request.json();

	if (!id) {
		return new Response(JSON.stringify({ error: 'ID es requerido' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const stmt = db.prepare('DELETE FROM objetos WHERE id = ?');
	const info = stmt.run(id); //usamos stmt.run para un INSERT, DELETE,UPDATE

	if (info.changes === 0) {
		return new Response(JSON.stringify({ error: 'No se encontro el objeto' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const objetos = db.prepare('SELECT id, nombre, descripcion, categoria, disponible, fecha_creacion FROM objetos').all();
	return new Response(JSON.stringify({ success: true, objetos }), {
		headers: { 'Content-Type': 'application/json' }
	});
}

//PUT PARA UPDATE
export async function PUT({ request }) {
	const { id, nombre, descripcion, categoria, disponible} = await request.json();
	const trimmedName = nombre?.trim();
console.log(id, nombre, descripcion, categoria, disponible)

	
	if (!id || !nombre || !categoria) {
		return new Response(JSON.stringify({ error: 'id, nombre y categoria son requeridos' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Check if name already exists (case-insensitive, excluding self)
	const exists = db
		.prepare('SELECT 1 FROM objetos WHERE nombre = ? AND categoria = ? AND id != ?')
		.get(nombre, categoria, id);
	if (exists) {
		return new Response(JSON.stringify({ error: 'El objeto en esa categoria ya existe' }), {
			status: 409,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const stmt = db.prepare('UPDATE objetos SET nombre = ?, categoria=? WHERE id = ?');
	const info = stmt.run(trimmedName,categoria, id); //usamos stmt.run para un INSERT, DELETE,UPDATE

	if (info.changes === 0) {
		return new Response(JSON.stringify({ error: 'No se encontro el objeto' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const objetos = db.prepare('SELECT id, nombre, descripcion, categoria, disponible, fecha_creacion FROM objetos').all();
	
	return new Response(JSON.stringify({ success: true, objetos }), {
		headers: { 'Content-Type': 'application/json' }
	});
}