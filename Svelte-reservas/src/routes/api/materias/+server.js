import db from '$lib/db.js'; //importamos nuestra configuracion de base de datos

//operaciones segun el tipo de consulta SQL:
// SELECT sin parametros=> all()
// SELECT con parametros=> get(parametros)
// INSERT, UPDATE, DELETE =>run()

//GET PARA LISTAR
export async function GET() {
	const stmt = db.prepare('SELECT id,nombre,anio,fecha_creacion FROM materias');
	const materiasBD = stmt.all(); //usamos stmt.all() para un SELECT sin parametros]*/
	console.log(materiasBD);

	const stmt2 = db.prepare('SELECT count(*) FROM materias');
	const cantBD = stmt2.all(); //usamos stmt.all() para un SELECT sin parametros]*/
	console.log(cantBD);

	return new Response(JSON.stringify(materiasBD), {
		headers: { 'Content-Type': 'application/json' }
	});
}

//POST PARA GUARDAR
export async function POST({ request }) {
	const body = await request.json();
	console.log('body', body);
//nombre, apellido, dni, telefono

	const nombre = body.nombre;
	const anio = body.anio;
	
	if (!nombre || !anio) {
		return new Response(JSON.stringify({ error: 'Nombre y anio son requeridos' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Check if name already exists (case-insensitive)
	//usamos st
	const stmsBusqueda = db.prepare('SELECT 1 FROM materias WHERE nombre = ? AND anio = ? ');
	const exists = stmsBusqueda.get(nombre, anio); //usamos stmt.get para un SELECT con parametros

	if (exists) {
		return new Response(JSON.stringify({ error: 'La materia en este anio ya existe' }), {
			status: 409,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const stmt = db.prepare('INSERT INTO materias (nombre, anio) VALUES (?, ?)');
	stmt.run(nombre.trim(), anio.trim()); //usamos stmt.run para un INSERT, DELETE,UPDATE

	const materias = db.prepare('SELECT id, nombre, anio, fecha_creacion FROM materias').all();

	return new Response(
		JSON.stringify({
			success: true,
			materias 
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

	const stmt = db.prepare('DELETE FROM materias WHERE id = ?');
	const info = stmt.run(id); //usamos stmt.run para un INSERT, DELETE,UPDATE

	if (info.changes === 0) {
		return new Response(JSON.stringify({ error: 'No se encontro la materia' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const materias = db.prepare('SELECT id, nombre, anio fecha_creacion FROM materias').all();
	return new Response(JSON.stringify({ success: true, materias }), {
		headers: { 'Content-Type': 'application/json' }
	});
}

//PUT PARA UPDATE
export async function PUT({ request }) {
	const { id, nombre, anio} = await request.json();
	const trimmedName = nombre?.trim();
console.log(id, nombre, anio)

	
	if (!id || !nombre || !anio) {
		return new Response(JSON.stringify({ error: 'id, nombre y anio son requeridos' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Check if name already exists (case-insensitive, excluding self)
	const exists = db
		.prepare('SELECT 1 FROM materias WHERE nombre = ? AND anio = ? AND id != ?')
		.get(nombre, anio, id);
	if (exists) {
		return new Response(JSON.stringify({ error: 'La materia en ese año ya existe' }), {
			status: 409,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const stmt = db.prepare('UPDATE materias SET nombre = ?, anio=? WHERE id = ?');
	const info = stmt.run(trimmedName,anio, id); //usamos stmt.run para un INSERT, DELETE,UPDATE

	if (info.changes === 0) {
		return new Response(JSON.stringify({ error: 'No se encontro la materia' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const materias = db.prepare('SELECT id, nombre,anio, fecha_creacion FROM materias').all();
	
	return new Response(JSON.stringify({ success: true, materias }), {
		headers: { 'Content-Type': 'application/json' }
	});
}