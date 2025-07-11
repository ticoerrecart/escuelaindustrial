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
			alert('Error al recuperar los profesores');
		}
	}

	let objetosDisponiblesParaReservar = [];

	async function obtenerObjetosDisponiblesParaReservar() {
		console.log('obtener objetos');
		const res = await fetch('/api/reservas');

		const listado = await res.json();
		console.log(listado);
		if (listado) {
			//actualizar la lista de objetos disponibles, nos tiene que venir de la respuesta
			objetosDisponiblesParaReservar = listado;
			//editingId = null;
		} else {
			alert('Error al recuperar los objetos disponibles para reservar');
		}
	}

	let reservas = [];

	let idObjetosSeleccionados = [];
	$: objetosSeleccionados = objetosDisponiblesParaReservar.filter((obj) =>
		idObjetosSeleccionados.includes(obj.id)
	);
	//busco el objeto seleccionado dentro de todos los objetos
	// Objeto reactivo que se actualiza automáticamente cuando cambia selectedId
	//$: objetoSeleccionado = objetos.find(obj => obj.id === idObjetoSeleccionado);

	const tamanioReservasAMostrar = 10;
	$: cantReservasAmostrar =
		reservas.length >= 0 && reservas.length < tamanioReservasAMostrar
			? reservas.length
			: tamanioReservasAMostrar;

	function agregarObjeto() {
		if (idObjetosSeleccionados.length > 0) {
			// Quitar el seleccionado de los objetos disponibles
			objetosDisponiblesParaReservar = objetosDisponiblesParaReservar.filter(
				(obj) => !idObjetosSeleccionados.includes(obj.id)
			);

			// Agregar a seleccionados
			reservas = [...reservas, ...objetosSeleccionados];

			idObjetosSeleccionados = [];
		}
	}

	let idObjetosSeleccionadosASacar = [];
	$: objetosSeleccionadosASacar = reservas.filter((obj) =>
		idObjetosSeleccionadosASacar.includes(obj.id)
	);
	function sacarObjeto() {
		if (idObjetosSeleccionadosASacar.length > 0) {
			// Quitar el seleccionado de los objetos disponibles
			reservas = reservas.filter((obj) => !idObjetosSeleccionadosASacar.includes(obj.id));

			// Agregar a seleccionados
			objetosDisponiblesParaReservar = [
				...objetosDisponiblesParaReservar,
				...objetosSeleccionadosASacar
			];

			idObjetosSeleccionadosASacar = [];
		}
	}

	$: deshabilitarBotonReservas =
		reservas.length === 0 || !idProfesorSeleccionado || !idMateriaSeleccionada;

	async function realizarReserva() {
		//debugger;
		const reserva = {
			idProfesor: idProfesorSeleccionado,
			idMateria: idMateriaSeleccionada,
			objetos: reservas
		};

		console.log(reserva);
		const res = await fetch('/api/reservas', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(reserva)
		});

		const data = await res.json();
		if (data.success) {
			alert(`Exito.  Se reservaron ${data.respuesta.objetosReservados} objetos.`);
			console.log(data.respuesta.objetos);
			//actualizar la lista de objetos disponibles, nos tiene que venir de la respuesta
			objetosDisponiblesParaReservar = data.respuesta.objetos;
			//personas = data.personas;
			//editingId = null;
			reservas = [];
		} else {
			alert(data.error || 'Error al guardar la reserva');
		}
	}

	//al ingresar a la pagina por 1ra vez, cargamos lo que necesitemos
	onMount(() => {
		obtenerObjetosDisponiblesParaReservar();
		obtenerProfesores();
		obtenerMaterias();
	});
</script>

<h2>Reservas</h2>

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
{:else}
	<p>Esperando selección...</p>
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
{:else}
	<p>Esperando selección...</p>
{/if}

<br /><br /><br />
<label for="objetos-choice">Objetos disponibles para Reservar:</label>
<select id="objetosSelect" bind:value={idObjetosSeleccionados} multiple size={10}>
	<option value="" disabled selected>Seleccione un objeto a reservar</option>
	{#each objetosDisponiblesParaReservar as objeto}
		<option
			value={objeto.id}
			on:dblclick={() => {
				agregarObjeto();
			}}>{objeto.nombre}</option
		>
	{/each}
</select>

<button on:click={agregarObjeto} disabled={idObjetosSeleccionados.length === 0}>
	➡️ Agregar
</button>

<button on:click={sacarObjeto} disabled={idObjetosSeleccionadosASacar.length === 0}>
	⬅️ Eliminar
</button>

<label for="reserva-choice">Reservas ({reservas.length}):</label>
<select id="reserva" size={cantReservasAmostrar} multiple bind:value={idObjetosSeleccionadosASacar}>
	{#each reservas as objeto}
		<option
			value={objeto.id}
			on:dblclick={() => {
				sacarObjeto();
			}}>{objeto.nombre}</option
		>
	{/each}
</select>
<br />

{#if objetosSeleccionados.length > 0}
	Objetos disponibles seleccionados
	<ul>
		{#each objetosSeleccionados as objeto}
			<li>{objeto.nombre}</li>
		{/each}
	</ul>
{/if}

{#if objetosSeleccionadosASacar.length > 0}
	Objetos reservados seleccionados
	<ul>
		{#each objetosSeleccionadosASacar as objeto}
			<li>{objeto.nombre}</li>
		{/each}
	</ul>
{/if}

<button
	class="btn btn-primary {deshabilitarBotonReservas ? 'disabled' : ''}"
	on:click={realizarReserva}
>
	Realizar Reserva
</button>
