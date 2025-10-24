<script>
	import { onMount } from 'svelte';

	let clase_id = 1; // Se podría pasar como parámetro dinámico
	let alumnos = [];
	let estados = ['Presente', 'Ausente', 'Tarde', 'Se retira', 'Justificada'];
	let mensaje = '';

	// Estructura para guardar la asistencia de cada alumno
	let asistencia = {};

	async function cargarAlumnos() {
		const res = await fetch(`/api/clase/${clase_id}/alumnos`);
		alumnos = await res.json();

		// Inicializar asistencia por alumno
		asistencia = {};
		alumnos.forEach((a) => {
			asistencia[a.id] = {
				estado: 'Presente',
				hora_ingreso: '',
				hora_egreso: ''
			};
		});
	}

	async function guardarAsistencia() {
		for (const alumno of alumnos) {
			const { estado, hora_ingreso, hora_egreso } = asistencia[alumno.id];

			await fetch('/api/asistencia', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					clase_id,
					alumno_id: alumno.id,
					estado,
					hora_ingreso: hora_ingreso || null,
					hora_egreso: hora_egreso || null
				})
			});
		}

		mensaje = '✅ Asistencias guardadas para la clase ' + clase_id;
	}

	onMount(cargarAlumnos);
</script>

<h1 style="color:red">DEPRECATED, usar /asistencia</h1>
<h2>Registrar asistencia - Clase {clase_id}</h2>

{#if alumnos.length === 0}
	<p>Cargando alumnos...</p>
{:else}
	<form on:submit|preventDefault={guardarAsistencia}>
		<table border="1" cellpadding="5">
			<thead>
				<tr>
					<th>Alumno</th>
					<th>Estado</th>
					<th>Hora ingreso</th>
					<th>Hora egreso</th>
				</tr>
			</thead>
			<tbody>
				{#each alumnos as alumno}
					<tr>
						<td>{alumno.nombre}</td>
						<td>
							<select bind:value={asistencia[alumno.id].estado}>
								{#each estados as e}
									<option value={e}>{e}</option>
								{/each}
							</select>
						</td>
						<td>
							<input type="time" bind:value={asistencia[alumno.id].hora_ingreso} />
						</td>
						<td>
							<input type="time" bind:value={asistencia[alumno.id].hora_egreso} />
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<button type="submit">Guardar asistencia</button>
	</form>
{/if}

<p>{mensaje}</p>
