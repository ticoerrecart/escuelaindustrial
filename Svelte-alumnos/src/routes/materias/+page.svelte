<script>
	import { onMount } from 'svelte';

	let nombre = '';
	let profesor_id = '';
	let materias = [];
	let profesores = [];
	let mensaje = '';
	let clases = [];

	const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

	async function cargarProfesores() {
		const res = await fetch('/api/profesores');
		profesores = await res.json();
	}

	async function cargarMaterias() {
		const res = await fetch('/api/materias');
		materias = await res.json();
		console.log(materias);
	}

	function agregarClase() {
		clases = [...clases, { dias: [], hora_inicio: '', hora_fin: '' }];
	}

	function eliminarClase(index) {
		clases = clases.filter((_, i) => i !== index);
	}

	function toggleDia(claseIndex, dia) {
		const dias = clases[claseIndex].dias;
		if (dias.includes(dia)) {
			clases[claseIndex].dias = dias.filter((d) => d !== dia);
		} else {
			clases[claseIndex].dias = [...dias, dia];
		}
	}

	async function guardarMateria() {
		if (!nombre.trim()) {
			mensaje = '❌ Debes ingresar un nombre de materia';
			return;
		}

		const res = await fetch('/api/materias', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ nombre, profesor_id, clases })
		});

		const data = await res.json();
		if (data.success) {
			mensaje = '✅ Materia agregada con ID ' + data.id;
			nombre = '';
			profesor_id = '';
			clases = [];
			await cargarMaterias();
		} else {
			mensaje = '❌ Error: ' + (data.error || 'no se pudo guardar');
		}
	}

	onMount(async () => {
		await cargarProfesores();
		await cargarMaterias();
	});
</script>

<h2>Alta de materia</h2>

<form on:submit|preventDefault={guardarMateria}>
	<div>
		<label
			>Nombre:
			<input type="text" bind:value={nombre} required />
		</label>
	</div>
	<div>
		<label
			>Profesor:
			<select bind:value={profesor_id}>
				<option value="">-- Seleccionar --</option>
				{#each profesores as p}
					<option value={p.id}>{p.nombre}</option>
				{/each}
			</select>
		</label>
	</div>

	<h3>Clases</h3>
	{#each clases as c, i}
		<div style="margin-bottom: 0.5rem; border:1px solid #ccc; padding:0.5rem;">
			<div>
				<label>Hora inicio: <input type="time" bind:value={c.hora_inicio} /></label>
				<label>Hora fin: <input type="time" bind:value={c.hora_fin} /></label>
			</div>
			<div>
				{#each diasSemana as d}
					<label style="margin-right:0.5rem;">
						<input type="checkbox" checked={c.dias.includes(d)} on:change={() => toggleDia(i, d)} />
						{d}
					</label>
				{/each}
			</div>
			<button type="button" on:click={() => eliminarClase(i)}>Eliminar clase</button>
		</div>
	{/each}

	<button type="button" on:click={agregarClase} disabled={!nombre.length || !profesor_id}
		>Agregar clase</button
	>
	<div style="margin-top: 1rem;">
		<button type="submit" disabled={!nombre.length || !profesor_id || !clases.length}
			>Guardar materia y clases</button
		>
	</div>
</form>

<p>{mensaje}</p>

<h3>Materias registradas</h3>
<ul>
	{#each materias as m}
		<li>
			<strong>{m.id} - {m.nombre}</strong> ({m.profesor || 'Sin profesor'})
			<ul>
				{#each m.clases as c}
					<li>{c.dias.join(', ')} {c.hora_inicio} - {c.hora_fin}</li>
				{/each}
			</ul>
		</li>
	{/each}
</ul>
