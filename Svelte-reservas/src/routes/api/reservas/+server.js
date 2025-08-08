import db from '$lib/db.js'; //importamos nuestra configuracion de base de datos

//operaciones segun el tipo de consulta SQL:
// SELECT sin parametros=> all()
// SELECT con parametros=> get(parametros)
// INSERT, UPDATE, DELETE =>run()

//GET PARA LISTAR
export async function GET() {
	const stmt = db.prepare('SELECT id, nombre FROM objetos where disponible=true');
	const objetosDisponiblesParaReservar = stmt.all(); //usamos stmt.all() para un SELECT sin parametros]*/
	return new Response(JSON.stringify(objetosDisponiblesParaReservar), {
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

	// Example transaction
	const insertTransaction = db.transaction((idProfesor, idMateria, objetos) => {
		const insertReserva = db.prepare(
			'INSERT INTO reservas (fecha_creacion,id_profesor,id_materia) VALUES (?,?,?)'
		);

		const resultReserva = insertReserva.run(new Date().toISOString(), idProfesor, idMateria);
		console.log('resultReserva', resultReserva);
		console.log(resultReserva.lastInsertRowid);

		objetos.forEach((objeto) => {
			const insertReservaObjetos = db.prepare(
				'INSERT INTO reserva_objetos (id_reserva, id_objeto) VALUES (?, ?)'
			);
			insertReservaObjetos.run(resultReserva.lastInsertRowid, objeto.id);

			const updateObjetosDisponibles = db.prepare(
				'UPDATE objetos set disponible=false WHERE id= ?'
			);
			updateObjetosDisponibles.run(objeto.id);
		});
	});

	// Call it — if one insert fails, nothing is committed
	insertTransaction(idProfesor, idMateria, objetos);

	//devolver en objetos los que estan disponibles luego de quitar las reservas!!
	const stmt = db.prepare('SELECT id, nombre FROM objetos where disponible=true');
	const objetosDisponiblesParaReservar = stmt.all(); //usamos stmt.all() para un SELECT sin parametros]*/

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
