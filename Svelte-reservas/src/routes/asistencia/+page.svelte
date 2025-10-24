<script>
	import { onMount } from 'svelte';
	import Page from '../+page.svelte';

	let materias = [];
	let materia_id = '';
	let alumnos = [];
	let asistencias = {}; // { alumno_id: {estado, hora_ingreso, hora_egreso} }
	let mensaje = '';
	let estados = ['Presente', 'Ausente', 'Tarde', 'Se retira', 'Justificada'];
	let fechaAsistencia = new Date().toISOString().split('T')[0];
	let guardando = false;

	$: materiaSeleccionada = materias.find((mat) => mat.id === materia_id);
	$: horarios = materiaSeleccionada && fechaAsistencia ? obtenerHorariosClase() : null;

	let cantidadesPorEstado = {
		Presente: 0,
		Ausente: 0,
		Tarde: 0,
		'Se retira': 0,
		Justificada: 0
	};

	function obtenerCantidadesPorEstado(asistencias) {
		estados.forEach((estado) => {
			cantidadesPorEstado[estado] = 0;
		});

		for (const asistencia of Object.values(asistencias)) {
			console.log(asistencia.estado);
			cantidadesPorEstado[asistencia.estado]++;
		}
	}

	// Cargar todas las clases disponibles
	async function cargarMaterias() {
		const res = await fetch('/api/materias'); // nuevo endpoint que devuelve todas las clases
		materias = await res.json();
		alumnos = [];
		asistencias = {};
		materia_id = '';
	}

	function obtenerHorariosClase() {
		if (!materiaSeleccionada || !fechaAsistencia) return;

		const dayOfWeek = fechaAsistencia ? new Date(fechaAsistencia).getDay() : new Date().getDay(); // 0=Sunday, ..., 6=Saturday

		let diaDeLaSemana;

		switch (dayOfWeek) {
			case 0:
				diaDeLaSemana = 'lunes';
				break;
			case 1:
				diaDeLaSemana = 'martes';
				break;
			case 2:
				diaDeLaSemana = 'miércoles';
				break;
			case 3:
				diaDeLaSemana = 'jueves';
				break;
			case 4:
				diaDeLaSemana = 'viernes';
				break;
			case 5:
				diaDeLaSemana = 'sábado';
				break;
			case 6:
				diaDeLaSemana = 'domingo';
				break;
			default:
				diaDeLaSemana = '';
		}
		console.log('dayOfWeek', dayOfWeek);
		console.log('diaDeLaSemana', diaDeLaSemana);
		console.log(materiaSeleccionada);
		const horarios = materiaSeleccionada.clases.find((clase) => clase.dias.includes(diaDeLaSemana));
		console.log('horarios', horarios);
		return horarios;
		/*	const horarios = db
		.prepare('select hora_inicio,hora_fin from clase where materia_id = ? and dias like ? ')
		.get(materia_id, `%${diaDeLaSemana}%`);

	console.log(horarios);*/
	}

	function obtenerColor(estado) {
		if (estado === 'Ausente') return 'red';
		if (estado === 'Se retira' || estado === 'Tarde') return 'yellow';
		if (estado === 'Justificada') return 'green';
		return 'white';
	}

	// Cargar alumnos y asistencia de la clase seleccionada al seleccionar una materia
	async function cargarAlumnos() {
		if (!materia_id) return;

		// Cargar todos los alumnos (luego se puede filtrar por inscripción)
		const res = await fetch(`/api/alumnos?materia_id=${materia_id}`);
		const alumnosData = await res.json();

		const resAsist = await fetch(
			`/api/asistencias?materia_id=${materia_id}&fecha=${fechaAsistencia}`
		);
		const dataAsistencias = await resAsist.json();

		// Inicializar asistencias si no hay
		if (!dataAsistencias.length) {
			alumnosData.forEach((a) => {
				//if (!asistencias[a.id]) {
				asistencias[a.id] = {
					estado: 'Presente',
					hora_ingreso: horarios?.hora_inicio || '',
					hora_egreso: horarios?.hora_fin || '',
					color: 'white'
				};
				//}
			});
		}

		// Cargar asistencias existentes
		console.log('asistencias inicializadas', asistencias);
		dataAsistencias.forEach((a) => {
			asistencias[a.alumno_id] = {
				estado: a.estado,
				hora_ingreso: a.hora_ingreso,
				hora_egreso: a.hora_egreso,
				color: obtenerColor(a.estado)
			};
		});

		obtenerCantidadesPorEstado(asistencias);

		console.log('asistencias actualizadas', asistencias);
		alumnos = alumnosData;
	}

	// Guardar asistencias
	async function guardar() {
		const lista = alumnos.map((a) => ({
			materia_id: materia_id,
			alumno_id: a.id,
			estado: asistencias[a.id].estado,
			fecha: fechaAsistencia,
			hora_ingreso: asistencias[a.id].hora_ingreso || null,
			hora_egreso: asistencias[a.id].hora_egreso || null
		}));

		guardando = true;
		const res = await fetch('/api/asistencias', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ asistencias: lista })
		});

		const dataAsistencias = await res.json();
		guardando = false;
		if (dataAsistencias.success) {
			mensaje = '✅ Asistencias guardadas correctamente';
			await cargarAlumnos();
		} else {
			mensaje = '❌ Error: ' + dataAsistencias.error;
		}
	}

	onMount(async () => {
		await cargarMaterias();
	});
</script>

<h2>Gestión de asistencias</h2>

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

{#if alumnos.length > 0}
	Fecha:
	<input type="date" bind:value={fechaAsistencia} on:change={cargarAlumnos} />
	{#if horarios}
		<span>Horario de la clase: {horarios.hora_inicio} - {horarios.hora_fin}</span>
	{:else}
		<span style="color: red;">No hay horarios para la clase</span>
	{/if}
	<p>Cant. de alumnos: {alumnos.length}</p>

	<ul>
		{#each Object.entries(cantidadesPorEstado) as [clave, valor]}
			<li>{clave}: {valor}</li>
		{/each}
	</ul>
	<table border="1" cellpadding="5" style="margin-top: 1rem;">
		<thead>
			<tr>
				<th>Alumno</th>
				<th>Estado</th>
				<th>Hora ingreso</th>
				<th>Hora egreso</th>
			</tr>
		</thead>
		<tbody>
			{#each alumnos as a}
				<tr style="background-color: {asistencias[a.id].color}">
					<td>{a.nombre}</td>
					<td>
						<select bind:value={asistencias[a.id].estado}>
							{#each estados as e}
								<option value={e}>{e}</option>
							{/each}
						</select>
					</td>
					<td>
						<input type="time" bind:value={asistencias[a.id].hora_ingreso} />
					</td>
					<td>
						<input type="time" bind:value={asistencias[a.id].hora_egreso} />
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<button style="margin-top: 1rem;" on:click={guardar} disabled={guardando}>Guardar</button>
{/if}

<p>{mensaje}</p>
