import db from '$lib/db.js'; //importamos nuestra configuracion de base de datos

//operaciones segun el tipo de consulta SQL:
// SELECT sin parametros=> all()
// SELECT con parametros=> get(parametros)
// INSERT, UPDATE, DELETE =>run()

//GET PARA LISTAR
export async function GET() {
	const stmt = db.prepare('SELECT id,nombre,descripcion,categoria FROM objetos');
	const objetos = stmt.all(); //usamos stmt.all() para un SELECT sin parametros]*/
	return new Response(JSON.stringify(objetos), {
		headers: { 'Content-Type': 'application/json' }
	});
}

//POST PARA GUARDAR
export async function POST({ request }) {
	const body = await request.json();
	console.log('body', body);

	const idProfesor = body.idProfesor;
	const idMateria = body.idMateria;
	const objetos = body.objetos;

	if (!idProfesor) {
		return new Response(JSON.stringify({ error: 'Profesor es requerido' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	if (!idMateria) {
		return new Response(JSON.stringify({ error: 'Materia es requerido' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	if (!objetos) {
		return new Response(JSON.stringify({ error: 'Seleccione objetos a reservar' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Check if name already exists (case-insensitive)
	//usamos st
	/*const stmsBusqueda = db.prepare('SELECT 1 FROM personas WHERE LOWER(nombre) = LOWER(?)');
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
*/

	//devolver en objetos los que estan disponibles luego de quitar las reservas!!
	objetosDisponiblesParaReservar = objetosDisponiblesParaReservar.filter((obj) => {
		const elemSeleccionadoAReservar = objetos.find((obj1) => obj1.id === obj.id);
		return !elemSeleccionadoAReservar;
	});
	return new Response(
		JSON.stringify({
			success: true,
			respuesta: { objetos: objetosDisponiblesParaReservar, objetosReservados: objetos.length }
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
