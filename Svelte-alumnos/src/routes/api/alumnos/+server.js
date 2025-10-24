import db from '$lib/db.js'; //importamos nuestra configuracion de base de datos

//operaciones segun el tipo de consulta SQL:
// SELECT sin parametros=> all()
// SELECT con parametros=> get(parametros)
// INSERT, UPDATE, DELETE =>run()
export async function GET({ url }) {
	const materiaId = url.searchParams.get('materia_id');
	console.log('materiaId', materiaId);
	let rows;
	if (materiaId) {
		rows = db
			.prepare(
				`SELECT a.id, a.nombre FROM alumno_materia am inner join alumno a 
					ON am.alumno_id = a.id 
				WHERE am.materia_id=? ORDER BY a.nombre`
			)
			.all(materiaId);
	} else {
		rows = db.prepare(`SELECT id, nombre FROM alumno ORDER BY nombre`).all();
	}

	console.log(rows);
	return new Response(JSON.stringify(rows), {
		headers: { 'Content-Type': 'application/json' }
	});
}

export async function POST({ request }) {
	const { nombre, materia } = await request.json();

	if (!nombre || nombre.trim() === '') {
		return new Response(JSON.stringify({ success: false, error: 'Nombre requerido' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	if (!materia) {
		return new Response(JSON.stringify({ success: false, error: 'Materia requerido' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	/*const stmt = db.prepare('INSERT INTO alumno (nombre) VALUES (?)');
	const result = stmt.run(nombre.trim());

	return new Response(JSON.stringify({ success: true, id: result.lastInsertRowid }), {
		headers: { 'Content-Type': 'application/json' }
	});*/

	const stmtInsertAlumno = db.prepare('INSERT INTO alumno (nombre) VALUES (?)');
	const stmtInsertMateria = db.prepare(
		'INSERT INTO alumno_materia (alumno_id,materia_id) VALUES (?,?)'
	);

	let alumnoId;
	const transaction = db.transaction((nombre, materia) => {
		const result = stmtInsertAlumno.run(nombre);
		alumnoId = result.lastInsertRowid;
		stmtInsertMateria.run(alumnoId, materia);
	});

	try {
		transaction(nombre, materia);
		return new Response(JSON.stringify({ success: true, id: alumnoId }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		return new Response(JSON.stringify({ success: false, error: err.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
