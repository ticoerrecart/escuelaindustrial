<script>
	import { onMount } from 'svelte';

	let nombre = '';
	let mensaje = '';
	let materia_id;
	let alumnos = [];
	let materias = [];

	// Cargar todas las clases disponibles
	async function cargarMaterias() {
		const res = await fetch('/api/materias'); // nuevo endpoint que devuelve todas las clases
		materias = await res.json();
		alumnos = [];
	}

	// Cargar alumnos y asistencia de la clase seleccionada
	async function cargarAlumnos() {
		if (!materia_id) return;

		// Cargar todos los alumnos (luego se puede filtrar por inscripción)
		const res = await fetch(`/api/alumnos?materia_id=${materia_id}`);
		alumnos = await res.json();
	}

	async function guardarAlumno() {
		const res = await fetch('/api/alumnos', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ nombre, materia: materia_id })
		});

		const data = await res.json();

		if (data.success) {
			mensaje = '✅ Alumno agregado con ID ' + data.id;
			nombre = '';
			await cargarAlumnos();
		} else {
			mensaje = '❌ Error: ' + data.error;
		}
	}

	onMount(async () => {
		await cargarMaterias();
	});
</script>

<h2>Alta de alumno</h2>
<div>
	<label
		>Clase:
		<select bind:value={materia_id} on:change={cargarAlumnos}>
			<option value="">-- Seleccionar materia --</option>
			{#each materias as m}
				<option value={m.id}>
					{m.nombre} ({m.profesor || 'Sin profesor'})
				</option>
			{/each}
		</select>
	</label>
</div>

<form on:submit|preventDefault={guardarAlumno}>
	<label>Nombre: <input type="text" bind:value={nombre} required /></label>
	<button type="submit" disabled={!materia_id}>Guardar</button>
</form>

<p>{mensaje}</p>

<h3>Lista de alumnos</h3>

<ul>
	{#each alumnos as alumno}
		<li>{alumno.id} - {alumno.nombre}</li>
	{/each}
</ul>
