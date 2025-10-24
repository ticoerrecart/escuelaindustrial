<script>
  import { onMount } from "svelte";

  let nombre = "";
  let anio = "";
  let materias = [];
  let errores = "";
  let seleccionadoId = null;

  async function agregarMateria() {
    const res = await fetch("/api/materias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, anio }),
    });
    const data = await res.json();

    if (data.error) {
      errores = data.error;
      return;
    }
    materias = data.materias ?? materias;
    errores = "";
  }

  async function obtenerMateria() {
    const res = await fetch("/api/materias");
    materias = await res.json();
  }

  function seleccionarMateria(m) {
    nombre = m.nombre;
    anio = m.anio;
    seleccionadoId = m.id;
    errores = "";
  }

  async function modificarMateria() {
    if (!seleccionadoId) {
      errores = "Primero seleccioná una materia desde la lista (botón Cargar).";
      return;
    }

    const res = await fetch(`/api/materias`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: seleccionadoId,
        nombre,
        anio,
      }),
    });
    const data = await res.json();

    if (data.error) {
      errores = data.error;
      return;
    }

    errores = "";
    materias = data.materias ?? materias;
  }

  async function eliminarMateria() {
    if (!seleccionadoId) {
      errores = "Primero seleccioná una materia desde la lista (botón Cargar).";
      return;
    }

    const res = await fetch(`/api/materias`, {
      method: "DELETE",
      body: JSON.stringify({ id: seleccionadoId }),
    });
    const data = await res.json();

    if (data.error) {
      errores = data.error;
      return;
    }

    errores = "";
    materias = data.materias ?? materias;
  }

  onMount(obtenerMateria);
</script>

<h2>Ingrese materias</h2>

<div class="form">
  <input bind:value={nombre} placeholder="Ingrese el nombre" />
  <input bind:value={anio} placeholder="Ingrese el anio" />

  <div class="acciones-form">
    <button on:click={agregarMateria}>Agregar</button>
    <button on:click={modificarMateria} disabled={!seleccionadoId}
      >Modificar</button
    >
    <button on:click={eliminarMateria} disabled={!seleccionadoId}
      >Eliminar</button
    >
  </div>
</div>

{#if errores}
  <p class="error">{errores}</p>
{/if}

<div class="row align-items-header">
  <div class="col">ID</div>
  <div class="col">Nombre</div>
  <div class="col">Anio</div>
  <div class="col">Creacion</div>
  <div class="col">Acción</div>
</div>

{#each materias as materia (materia.id)}
  <div
    class="row align-items-body"
    class:selected={materia.id === seleccionadoId}
  >
    <div class="col">{materia.id}</div>
    <div class="col">{materia.nombre}</div>
    <div class="col">{materia.anio}</div>
    <div class="col">{materia.fecha_creacion}</div>
    <div class="col">
      <button on:click={() => seleccionarMateria(materia)}>Cargar</button>
    </div>
  </div>
{/each}

<style>
  .error {
    color: red;
  }
  .personas {
    color: green;
  }

  .row.align-items-header {
    font-weight: bold;
    background-color: blueviolet;
    margin-top: 15px;
  }

  .col {
    text-align: center;
    padding: 0.5px;
    border-width: 1.8px;
    border-style: solid;
    border-color: black;
  }

  .acciones-form {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    flex-wrap: wrap;
  }

  .seleccion {
    margin-top: 6px;
    font-style: italic;
  }

  .row.align-items-body.selected {
    background-color: #f3f3f3;
  }

  .form {
    margin-bottom: 10px;
  }
</style>