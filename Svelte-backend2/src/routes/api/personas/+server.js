import db from '$lib/db.js'; //importamos nuestra configuracion de base de datos

//operaciones segun el tipo de consulta SQL:
// SELECT sin parametros=> all()
// SELECT con parametros=> get(parametros)
// INSERT, UPDATE, DELETE =>run()

//GET PARA LISTAR
export async function GET() {
	const stmt = db.prepare('SELECT id, nombre,fecha FROM personas');
	const personas = stmt.all(); //usamos stmt.all() para un SELECT sin parametros
	return new Response(JSON.stringify(personas), {
		headers: { 'Content-Type': 'application/json' }
	});
}

//POST PARA GUARDAR
export async function POST({ request }) {
	const body = await request.json();
	const name = body.name?.trim();

	if (!name) {
		return new Response(JSON.stringify({ error: 'Nombre es requerido' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Check if name already exists (case-insensitive)
	//usamos st
	const stmsBusqueda = db.prepare('SELECT 1 FROM personas WHERE LOWER(nombre) = LOWER(?)');
	const exists = stmsBusqueda.get(name); //usamos stmt.get para un SELECT con parametros

	if (exists) {
		return new Response(JSON.stringify({ error: 'El nombre ya existe' }), {
			status: 409,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const stmt = db.prepare('INSERT INTO personas (nombre) VALUES (?)');
	stmt.run(name.trim()); //usamos stmt.run para un INSERT, DELETE,UPDATE

	const personas = db.prepare('SELECT id, nombre,fecha FROM personas').all();

	return new Response(JSON.stringify({ success: true, personas: personas }), {
		headers: { 'Content-Type': 'application/json' }
	});
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

	const stmt = db.prepare('DELETE FROM personas WHERE id = ?');
	const info = stmt.run(id); //usamos stmt.run para un INSERT, DELETE,UPDATE

	if (info.changes === 0) {
		return new Response(JSON.stringify({ error: 'No se encontro a la persona' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const personas = db.prepare('SELECT id, nombre, fecha FROM personas').all();
	return new Response(JSON.stringify({ success: true, personas }), {
		headers: { 'Content-Type': 'application/json' }
	});
}

//PUT PARA UPDATE
export async function PUT({ request }) {
	const { id, nombre } = await request.json();
	const trimmed = nombre?.trim();

	if (!id || !trimmed) {
		return new Response(JSON.stringify({ error: 'id y nombre son requeridos' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Check if name already exists (case-insensitive, excluding self)
	const exists = db
		.prepare('SELECT 1 FROM personas WHERE LOWER(nombre) = LOWER(?) AND id != ?')
		.get(trimmed, id);
	if (exists) {
		return new Response(JSON.stringify({ error: 'El nombre ya existe' }), {
			status: 409,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const stmt = db.prepare('UPDATE personas SET nombre = ? WHERE id = ?');
	const info = stmt.run(trimmed, id); //usamos stmt.run para un INSERT, DELETE,UPDATE

	if (info.changes === 0) {
		return new Response(JSON.stringify({ error: 'No se encontro a la persona' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const personas = db.prepare('SELECT id, nombre, fecha FROM personas').all();
	return new Response(JSON.stringify({ success: true, personas }), {
		headers: { 'Content-Type': 'application/json' }
	});
}
