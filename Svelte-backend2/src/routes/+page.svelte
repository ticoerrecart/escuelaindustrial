<script>
	import { onMount } from 'svelte';
	let name = '';
	let personas = [];
	let editingId = null;
	let editedName = '';

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

	async function obtenerPersonas() {
		//si no indicamos un method el dedault es GET
		const res = await fetch('/api/personas');
		personas = await res.json();
	}

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

	//al ingresar a la pagina por 1ra vez, buscamos el listado de personas
	onMount(obtenerPersonas);
</script>

<h2>Listado de personas</h2>

<input bind:value={name} placeholder="Ingrese el nombre" />
<button on:click={agregarPersona}>Agregar Persona</button>

<ul>
	{#each personas as persona}
		<li>
			{#if editingId === persona.id}
				<input bind:value={editedName} />
				<button on:click={() => actualizarPersona(persona.id, editedName)}>Guardar</button>
				<button on:click={cancelEdit}>Cancelar</button>
			{:else}
				{persona.nombre} ({persona.fecha})
				<button on:click={() => borrarPersona(persona.id)}>Eliminar</button>
				<button on:click={() => startEdit(persona)}>Edit</button>
			{/if}
		</li>
	{/each}
</ul>
