<script>
	import { onMount } from 'svelte';

	let nombre = '';
	let profesores = [];
	let mensaje = '';

	async function cargarProfesores() {
		const res = await fetch('/api/profesores');
		profesores = await res.json();
	}

	async function guardarProfesor() {
		if (!nombre.trim()) {
			mensaje = '❌ Debes ingresar un nombre';
			return;
		}

		const res = await fetch('/api/profesores', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ nombre })
		});

		const data = await res.json();
		if (data.success) {
			mensaje = '✅ Profesor agregado con ID ' + data.id;
			nombre = '';
			await cargarProfesores(); // refrescar lista
		} else {
			mensaje = '❌ Error: ' + (data.error || 'no se pudo guardar');
		}
	}

	onMount(cargarProfesores);
</script>

<h2>Alta de profesor</h2>

<form on:submit|preventDefault={guardarProfesor}>
	<label
		>Nombre:
		<input type="text" bind:value={nombre} placeholder="Ej: Juan Pérez" required />
	</label>
	<button type="submit">Guardar</button>
</form>

<p>{mensaje}</p>

<h3>Profesores registrados</h3>
<ul>
	{#each profesores as p}
		<li>{p.id} - {p.nombre}</li>
	{/each}
</ul>
