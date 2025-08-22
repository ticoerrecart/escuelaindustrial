import db from '$lib/db.js'; //importamos nuestra configuracion de base de datos

//operaciones segun el tipo de consulta SQL:
// SELECT sin parametros=> all()
// SELECT con parametros=> get(parametros)
// INSERT, UPDATE, DELETE =>run()

//GET PARA LISTAR
export async function GET({ url }) {
	const reservados = url.searchParams.get('reservados');
	const idProfesor = url.searchParams.get('idProfesor');

	let objetos;
	if (reservados) {
		console.log('reservados');
		let query = `SELECT obj.id, obj.nombre, r.fecha_creacion, p.nombre as nombre_profesor, p.apellido as apellido_profesor, m.nombre as nombre_materia 
			 FROM objetos obj inner join reserva_objetos ro
			 	on obj.id = ro.id_objeto
			inner join reservas r on r.id = ro.id_reserva
            inner join profesores p on p.id=r.id_profesor
			left join materias m on m.id=r.id_materia
			 where disponible=false`;

		let params = [];
		if (idProfesor) {
			query += ` and r.id_profesor=?`;
			params.push(idProfesor);
		}

		// Prepare and execute
		const stmt = db.prepare(query);
		objetos = stmt.all(...params);

		console.log(objetos.length);
	} else {
		const stmt = db.prepare('SELECT id, nombre FROM objetos where disponible=true');
		objetos = stmt.all(); //usamos stmt.all() para un SELECT sin parametros]*/
	}

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
	const objetosDisponibles = stmt.all(); //usamos stmt.all() para un SELECT sin parametros]*/

	return new Response(
		JSON.stringify({
			success: true,
			respuesta: { objetos: objetosDisponibles, objetosReservados: objetosDisponibles.length }
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
	const seleccionadosADevolver = await request.json();

	console.log('seleccionadosADevolver', seleccionadosADevolver);

	if (!seleccionadosADevolver) {
		return new Response(JSON.stringify({ error: 'la lista de objetos a devolver es requerido' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const updateTransaction = db.transaction((seleccionadosADevolver) => {
		seleccionadosADevolver.forEach((objetoADevolver) => {
			const updateReservaObjetos = db.prepare(
				'UPDATE reserva_objetos SET fecha_devolucion =? where id_objeto= ?'
			);
			updateReservaObjetos.run(new Date().toISOString(), objetoADevolver.id);

			const updateObjetosDisponibles = db.prepare('UPDATE objetos set disponible=true WHERE id= ?');
			updateObjetosDisponibles.run(objetoADevolver.id);
		});
	});

	// Call it — if one insert fails, nothing is committed
	updateTransaction(seleccionadosADevolver);

	return new Response(JSON.stringify({ success: true }), {
		headers: { 'Content-Type': 'application/json' }
	});
}
