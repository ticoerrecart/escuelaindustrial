import db from '$lib/db.js'; //importamos nuestra configuracion de base de datos

//operaciones segun el tipo de consulta SQL:
// SELECT sin parametros=> all()
// SELECT con parametros=> get(parametros)
// INSERT, UPDATE, DELETE =>run()

export async function GET() {
	// Obtener materias con profesor
	const materias = db
		.prepare(
			`
    SELECT m.id, m.nombre, p.nombre AS profesor
    FROM materia m
    LEFT JOIN profesor p ON m.profesor_id = p.id
    ORDER BY m.nombre
  `
		)
		.all();

	// Para cada materia, traer sus clases
	const stmtClases = db.prepare(`
    SELECT id, dias, hora_inicio, hora_fin
    FROM clase
    WHERE materia_id = ?
    ORDER BY hora_inicio
  `);

	const result = materias.map((m) => {
		const clases = stmtClases.all(m.id).map((c) => ({
			...c,
			dias: JSON.parse(c.dias) // convertir JSON a array
		}));
		return { ...m, clases };
	});
	console.log(result);
	return new Response(JSON.stringify(result), {
		headers: { 'Content-Type': 'application/json' }
	});
}

export async function POST({ request }) {
	const { nombre, profesor_id, clases } = await request.json();
	console.log(nombre, profesor_id, clases);
	if (!nombre || nombre.trim() === '') {
		return new Response(JSON.stringify({ success: false, error: 'Nombre requerido' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const stmtInsertMateria = db.prepare('INSERT INTO materia (nombre,profesor_id) VALUES (?,?)');
	const stmtInsertClases = db.prepare(
		'INSERT INTO clase (materia_id, dias, hora_inicio, hora_fin) VALUES (?,?,?,?)'
	);

	let materiaId;
	const transaction = db.transaction((nombre, profesor_id, clases) => {
		const result = stmtInsertMateria.run(nombre, profesor_id);
		materiaId = result.lastInsertRowid;

		clases.forEach((clase) => {
			console.log('clase', clase);
			stmtInsertClases.run(
				materiaId,
				JSON.stringify(clase.dias),
				clase.hora_inicio,
				clase.hora_fin
			);
		});
	});

	try {
		transaction(nombre, profesor_id, clases);
		return new Response(JSON.stringify({ success: true, id: materiaId }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		return new Response(JSON.stringify({ success: false, error: err.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
