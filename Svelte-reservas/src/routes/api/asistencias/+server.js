import db from '$lib/db.js'; //importamos nuestra configuracion de base de datos

//operaciones segun el tipo de consulta SQL:
// SELECT sin parametros=> all()
// SELECT con parametros=> get(parametros)
// INSERT, UPDATE, DELETE =>run()

import db from '$lib/db.js'; //importamos nuestra configuracion de base de datos

// Obtener asistencias de una materia
export async function GET({ url }) {
	const materia_id = url.searchParams.get('materia_id');
	const fecha = url.searchParams.get('fecha');

	if (!materia_id || !fecha) {
		return new Response(JSON.stringify({ success: false, error: 'materia_id y fecha requerido' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	console.log('materia_id', materia_id);
	console.log('fecha', fecha);
	const asistencias = db
		.prepare(
			`SELECT a.id, materia_id, alumno_id, estado, fecha, hora_ingreso, hora_egreso
              FROM asistencia a inner join materia m
			  	on a.materia_id = m.id
				inner join alumno alu
					on alu.id = a.alumno_id
              WHERE materia_id = ? and a.fecha = ?
              ORDER BY alu.nombre asc`
		)
		.all(materia_id, fecha);

	return new Response(JSON.stringify(asistencias), {
		headers: { 'Content-Type': 'application/json' }
	});

	/*const clases = db
		.prepare(
			`SELECT id, fecha, hora_inicio, hora_fin
              FROM clase
              WHERE materia_id = ?
              ORDER BY fecha, hora_inicio`
		)
		.all(materia_id);

	return new Response(JSON.stringify(clases), {
		headers: { 'Content-Type': 'application/json' }
	});*/
}

// POST: guardar asistencias
export async function POST({ request }) {
	const { asistencias } = await request.json();

	if (!Array.isArray(asistencias)) {
		return new Response(JSON.stringify({ success: false, error: 'Faltan datos' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	console.log('asistencias', asistencias);
	const stmtInsert = db.prepare(`
    INSERT INTO asistencia (materia_id, alumno_id, estado, fecha, hora_ingreso, hora_egreso)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(materia_id, alumno_id, fecha)
    DO UPDATE SET
      estado = excluded.estado,
      hora_ingreso = excluded.hora_ingreso,
      hora_egreso = excluded.hora_egreso
  `);

	const transaction = db.transaction((lista) => {
		for (const a of lista) {
			stmtInsert.run(
				a.materia_id,
				a.alumno_id,
				a.estado,
				a.fecha,
				a.hora_ingreso || null,
				a.hora_egreso || null
			);
		}
	});

	try {
		transaction(asistencias);
		return new Response(JSON.stringify({ success: true }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		return new Response(JSON.stringify({ success: false, error: err.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
