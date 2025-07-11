<script>
	import { onMount } from 'svelte';

	//importamos css de bootstrap
	import 'bootstrap/dist/css/bootstrap.min.css';

	onMount(async () => {
		// Safe dynamic import
		//importamos js de bootstrap
		await import('bootstrap/dist/js/bootstrap.bundle.min.js');
	});
</script>

<div class="container">
	<nav class="navbar bg-body-tertiary">
		<div class="container">
			<a class="navbar-brand" href="/"> Inicio </a>
			<a class="navbar-brand" href="/profesores"> Profesores </a>
			<a class="navbar-brand" href="/materias"> Materias </a>
			<a class="navbar-brand" href="/objetos"> Objetos (notebooks, netbooks, proyector) </a>
			<a class="navbar-brand" href="/reservas"> Objetos a Reservar </a>
			<a class="navbar-brand" href="/reservados"> Objetos Reservados </a>
		</div>
	</nav>
	<br />

	<!-- ¡Esto es esencial! -->
	<slot />

	<!-- ¡Esto es esencial! -->
</div>
