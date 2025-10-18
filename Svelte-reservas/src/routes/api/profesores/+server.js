import db from '$lib/db.js'; //importamos nuestra configuracion de base de datos

//operaciones segun el tipo de consulta SQL:
// SELECT sin parametros=> all()
// SELECT con parametros=> get(parametros)
// INSERT, UPDATE, DELETE =>run()

//GET PARA LISTAR
export async function GET() {
	const stmt = db.prepare('SELECT id,nombre,apellido,dni,telefono,fecha_creacion FROM profesores');
	const profesoresBD = stmt.all(); //usamos stmt.all() para un SELECT sin parametros]*/
	console.log(profesoresBD);

	const stmt2 = db.prepare('SELECT count(*) FROM profesores');
	const cantBD = stmt2.all(); //usamos stmt.all() para un SELECT sin parametros]*/
	console.log(cantBD);

	return new Response(JSON.stringify(profesoresBD), {
		headers: { 'Content-Type': 'application/json' }
	});
}

//POST PARA GUARDAR
export async function POST({ request }) {
	const body = await request.json();
	console.log('body', body);
//nombre, apellido, dni, telefono

	const nombre = body.nombre;
	const apellido = body.apellido;
	const dni = body.dni;
	const telefono = body.telefono;

	
	if (!nombre || !apellido || !dni) {
		return new Response(JSON.stringify({ error: 'Nombre, apellido y DNI son requeridos' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Check if name already exists (case-insensitive)
	//usamos st
	const stmsBusqueda = db.prepare('SELECT 1 FROM profesores WHERE dni = ? ');
	const exists = stmsBusqueda.get(dni); //usamos stmt.get para un SELECT con parametros

	if (exists) {
		return new Response(JSON.stringify({ error: 'El profesor ya existe' }), {
			status: 409,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const stmt = db.prepare('INSERT INTO profesores (nombre, apellido, dni, telefono) VALUES (?, ?, ?, ?)');
	stmt.run(nombre.trim(), apellido.trim(), dni.trim(), telefono.trim()); //usamos stmt.run para un INSERT, DELETE,UPDATE

	const profesores = db.prepare('SELECT id, nombre, apellido, dni, telefono, fecha_creacion FROM profesores').all();

	return new Response(
		JSON.stringify({
			success: true,
			 profesores 
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

	const stmt = db.prepare('DELETE FROM profesores WHERE id = ?');
	const info = stmt.run(id); //usamos stmt.run para un INSERT, DELETE,UPDATE

	if (info.changes === 0) {
		return new Response(JSON.stringify({ error: 'No se encontro al profesor' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const profesores = db.prepare('SELECT id, nombre, apellido, dni, telefono, fecha_creacion FROM profesores').all();
	return new Response(JSON.stringify({ success: true, profesores }), {
		headers: { 'Content-Type': 'application/json' }
	});
}

//PUT PARA UPDATE
export async function PUT({ request }) {
	const { id, nombre, apellido, dni, telefono } = await request.json();
	const trimmedName = nombre?.trim();
console.log(id, nombre, apellido, dni, telefono)

	
	if (!id || !dni) {
		return new Response(JSON.stringify({ error: 'id y dni son requeridos' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Check if name already exists (case-insensitive, excluding self)
	const exists = db
		.prepare('SELECT 1 FROM profesores WHERE dni = ? AND id != ?')
		.get(dni, id);
	if (exists) {
		return new Response(JSON.stringify({ error: 'El dni del profesor ya existe' }), {
			status: 409,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const stmt = db.prepare('UPDATE profesores SET nombre = ?, apellido=?,dni=?,telefono=? WHERE id = ?');
	const info = stmt.run(trimmedName,apellido,dni,telefono, id); //usamos stmt.run para un INSERT, DELETE,UPDATE

	if (info.changes === 0) {
		return new Response(JSON.stringify({ error: 'No se encontro a la persona' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const profesores = db.prepare('SELECT id, nombre,apellido,dni,telefono, fecha_creacion FROM profesores').all();
	
	return new Response(JSON.stringify({ success: true, profesores }), {
		headers: { 'Content-Type': 'application/json' }
	});
}