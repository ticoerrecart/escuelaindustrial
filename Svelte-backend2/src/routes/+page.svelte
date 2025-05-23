<script>
	import { onMount } from 'svelte';
	let name = '';
	let personas = [];

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
		const res = await fetch('/api/personas');
		personas = await res.json();
	}

	onMount(obtenerPersonas);
</script>

<h2>Listado de personas</h2>

<input bind:value={name} placeholder="Ingrese el nombre" />
<button on:click={agregarPersona}>Agregar Persona</button>

<ul>
	{#each personas as persona}
		<li>{persona.nombre} ({persona.fecha})</li>
	{/each}
</ul>
