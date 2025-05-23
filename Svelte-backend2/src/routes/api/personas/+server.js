import db from '$lib/db.js';

//let personas = [];

export async function GET() {
	const stmt = db.prepare('SELECT id, nombre,fecha FROM personas');
	const personas = stmt.all();
	return new Response(JSON.stringify(personas), {
		headers: { 'Content-Type': 'application/json' }
	});
}

export async function POST({ request }) {
	const body = await request.json();
	const name = body.name?.trim();

	if (!name) {
		return new Response(JSON.stringify({ error: 'Nombre es requirido' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Check if name already exists (case-insensitive)
	const exists = db.prepare('SELECT 1 FROM personas WHERE LOWER(nombre) = LOWER(?)').get(name);

	if (exists) {
		return new Response(JSON.stringify({ error: 'El nombre ya existe' }), {
			status: 409,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const stmt = db.prepare('INSERT INTO personas (nombre) VALUES (?)');
	stmt.run(name.trim());

	const personas = db.prepare('SELECT id, nombre,fecha FROM personas').all();

	return new Response(JSON.stringify({ success: true, personas: personas }), {
		headers: { 'Content-Type': 'application/json' }
	});
}
