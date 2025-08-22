<script>
	import { onMount } from 'svelte';

	let profesores = [];
	async function obtenerProfesores() {
		console.log('obtener profesores');
		const res = await fetch('/api/profesores');

		const listado = await res.json();
		console.log(listado);
		if (listado) {
			//actualizar la lista de objetos disponibles, nos tiene que venir de la respuesta
			profesores = listado;
			//editingId = null;
		} else {
			alert('Error al recuperar los profesores');
		}
	}

	let nombreProfesor = '';
	// El ID se actualizará automáticamente cuando cambie nombreProfesor
	$: idProfesorSeleccionado =
		profesores.find((p) => `${p.nombre},${p.apellido}` === nombreProfesor)?.id ?? null;

	let materias = [];
	let idMateriaSeleccionada;

	async function obtenerMaterias() {
		console.log('obtener materias');
		const res = await fetch('/api/materias');

		const listado = await res.json();
		console.log(listado);
		if (listado) {
			//actualizar la lista de objetos disponibles, nos tiene que venir de la respuesta
			materias = listado;
			//editingId = null;
		} else {
			alert('Error al recuperar las materias');
		}
	}

	//----------buscar
	let objetosReservados = [];
	let seleccionadosMap = {};
	let selectAll = false;

	async function obtenerObjetosReservados() {
		console.log('obtener objetos');
		let conProfesor = '';
		if (idProfesorSeleccionado) {
			conProfesor = `&idProfesor=${idProfesorSeleccionado}`;
		}
		const res = await fetch(`/api/reservas?reservados=true` + conProfesor);

		const listado = await res.json();
		console.log(listado);
		if (listado) {
			//actualizar la lista de objetos disponibles, nos tiene que venir de la respuesta
			objetosReservados = listado;
			//seleccionadosMap = {};
			//selectAll = false;
		} else {
			alert('Error al recuperar los objetos reservados');
		}
	}

	$: deshabilitarBotonBusqueda = false; //!idProfesorSeleccionado;

	$: deshabilitarBotonDevolverObjetos = false;

	//seleccionar/deseleccionar objeto
	// Lista de seleccionados
	$: seleccionadosADevolver = objetosReservados.filter((o) => seleccionadosMap[o.id]);

	function toggleObjeto(id, checked) {
		seleccionadosMap[id] = checked;
		selectAll = objetosReservados.every((o) => seleccionadosMap[o.id]);
		//console.log('selectAll', selectAll);
		//console.log('seleccionadosADevolver', seleccionadosADevolver);
	}

	function toggleSelectAll(checked) {
		//console.log('checked', checked);
		selectAll = checked;
		for (let obj of objetosReservados) {
			seleccionadosMap[obj.id] = checked;
		}
		//console.log('seleccionadosMap', seleccionadosMap);
		//console.log('seleccionadosADevolver', seleccionadosADevolver);
	}

	async function devolverObjetosReservados() {
		console.log('aDevolver', seleccionadosADevolver);

		const res = await fetch('/api/reservas', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(seleccionadosADevolver)
		});

		const data = await res.json();
		if (data.success) {
			alert(`Exito.  Se devolvieron los objetos.`);

			obtenerObjetosReservados();
		} else {
			alert(data.error || 'Error al devolver los objetos');
		}
	}

	//esta es la manera segura de ver bien los cambios cuando una variable es dependiente (oea $:)
	$: console.log('seleccionadosADevolver', seleccionadosADevolver);
	//al ingresar a la pagina por 1ra vez, cargamos lo que necesitemos
	onMount(() => {
		//obtenerObjetosDisponiblesParaReservar();
		obtenerProfesores();
		obtenerMaterias();
	});
</script>

<h2>Objetos reservados</h2>

<label for="profestores-choice">Profesores:</label>
<input
	list="profesores"
	id="profesores-id"
	name="Profesores"
	placeholder="Escriba el nombre del profesor"
	bind:value={nombreProfesor}
/>

<datalist id="profesores">
	{#each profesores as profesor}
		<option value="{profesor.nombre},{profesor.apellido}"></option>
	{/each}
</datalist>
{#if idProfesorSeleccionado}
	<p>Seleccionaste el ID: {idProfesorSeleccionado}</p>
{/if}

<br /><br /><br />
<label for="materias-choice">Materias:</label>
<select id="materias" bind:value={idMateriaSeleccionada}>
	<option value="" disabled selected>Seleccione una materia</option>
	{#each materias as materia}
		<option value={materia.id}>{materia.nombre}</option>
	{/each}
</select>
{#if idMateriaSeleccionada}
	<p>Seleccionaste el ID: {idMateriaSeleccionada}</p>
{/if}

<br /><br /><br />

<button
	class="btn btn-primary {deshabilitarBotonBusqueda ? 'disabled' : ''}"
	on:click={obtenerObjetosReservados}
>
	Buscar
</button>

{#if objetosReservados.length > 0}
	<div class="row">
		<div class="col">id</div>
		<div class="col">nombre</div>
		<div class="col">fecha_creacion</div>
		<div class="col">nombre_profesor</div>
		<div class="col">apellido_profesor</div>
		<div class="col">nombre_materia</div>
		<div class="col">
			<input
				type="checkbox"
				bind:checked={selectAll}
				on:change={(e) => toggleSelectAll(e.target.checked)}
			/>
			<strong>Seleccionar todos</strong>
		</div>
	</div>
	{#each objetosReservados as objeto}
		<div class="row">
			<div class="col">{objeto.id}</div>
			<div class="col">{objeto.nombre}</div>
			<div class="col">{objeto.fecha_creacion}</div>
			<div class="col">{objeto.nombre_profesor}</div>
			<div class="col">{objeto.apellido_profesor}</div>
			<div class="col">{objeto.nombre_materia}</div>
			<div class="col">
				<input
					type="checkbox"
					bind:checked={seleccionadosMap[objeto.id]}
					on:change={(e) => toggleObjeto(objeto.id, e.target.checked)}
				/>
			</div>
		</div>
	{/each}

	<div class="row">
		<div class="col text-center">
			<button
				class="btn btn-primary {deshabilitarBotonDevolverObjetos ? 'disabled' : ''}"
				on:click={devolverObjetosReservados}
				disabled={seleccionadosADevolver.length === 0}
			>
				Devolver
			</button>
		</div>
	</div>
{/if}

<style>
	/* Apply alternating colors to rows */
	.row:nth-child(odd) {
		background-color: #f8f9fa; /* light gray */
	}
	.row:nth-child(even) {
		background-color: #e9ecef; /* slightly darker */
	}

	/* Optional: spacing inside cells */
	.col {
		padding: 1rem;
		border: 1px solid #dee2e6;
	}
</style>
