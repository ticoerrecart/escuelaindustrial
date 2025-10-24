import db from '$lib/db.js'; //importamos nuestra configuracion de base de datos

//operaciones segun el tipo de consulta SQL:
// SELECT sin parametros=> all()
// SELECT con parametros=> get(parametros)
// INSERT, UPDATE, DELETE =>run()

// Listar profesores
export async function GET() {
	const rows = db.prepare('SELECT id, nombre FROM profesor ORDER BY nombre').all();
	return new Response(JSON.stringify(rows), {
		headers: { 'Content-Type': 'application/json' }
	});
}

// Alta de profesor
export async function POST({ request }) {
	const { nombre } = await request.json();

	if (!nombre) {
		return new Response(JSON.stringify({ success: false, error: 'Nombre requerido' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const stmt = db.prepare('INSERT INTO profesor (nombre) VALUES (?)');
	const result = stmt.run(nombre);

	return new Response(JSON.stringify({ success: true, id: result.lastInsertRowid }), {
		headers: { 'Content-Type': 'application/json' }
	});
}
