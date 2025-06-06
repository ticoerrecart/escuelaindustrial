<script>
	import { onMount } from 'svelte';
	let name = ''; //nombre de la persona a agregar
	let personas = []; //listado de personas a mostrar

	let editingId = null; //id de la persona que queremos modificar
	let editedName = ''; //nombre de la persona que queremos modificar

	//------------------------------------ INSERT
	async function agregarPersona() {
		const res = await fetch('/api/personas', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name })
		});

		const data = await res.json();
		if (data.error) {
			alert(data.error);
		}
		if (data.personas) {
			personas = data.personas;
			name = '';
		}
	}

	//------------------------------------SELECT
	async function obtenerPersonas() {
		//si no indicamos un method el dedault es GET
		const res = await fetch('/api/personas');
		personas = await res.json();
	}

	//------------------------------------DELETE
	async function borrarPersona(id) {
		const res = await fetch('/api/personas', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id })
		});

		const data = await res.json();
		if (data.success) {
			personas = data.personas;
		} else {
			alert(data.error);
		}
	}
	//------------------------------------UPDATE
	async function actualizarPersona(id, nombre) {
		console.log(id, nombre);
		const res = await fetch('/api/personas', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id, nombre })
		});

		const data = await res.json();
		if (data.success) {
			personas = data.personas;
			editingId = null;
		} else {
			alert(data.error || 'Error en la actualizacion de la persona');
		}
	}

	function startEdit(persona) {
		editingId = persona.id;
		editedName = persona.nombre;
	}

	function cancelEdit() {
		editingId = null;
	}
	//------------------------------------

	//al ingresar a la pagina por 1ra vez, buscamos el listado de personas
	onMount(obtenerPersonas);
</script>

<h5>Listado de personas</h5>

<input bind:value={name} placeholder="Ingrese el nombre" />
<button on:click={agregarPersona} class="btn btn-primary">Agregar Persona</button>
<br />
<br />
<ul>
	{#each personas as persona}
		<li>
			{#if editingId === persona.id}
				<input bind:value={editedName} />
				<button on:click={() => actualizarPersona(persona.id, editedName)} class="btn btn-secondary"
					>Guardar</button
				>
				<button on:click={cancelEdit} class="btn btn-secondary">Cancelar</button>
			{:else}
				{persona.nombre} ({persona.fecha})
				<button on:click={() => borrarPersona(persona.id)} class="btn btn-secondary"
					>Eliminar</button
				>
				<button on:click={() => startEdit(persona)} class="btn btn-secondary">Edit</button>
			{/if}
		</li>
		<br />
	{/each}
</ul>
