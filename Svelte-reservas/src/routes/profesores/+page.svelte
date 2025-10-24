<script>
  import { onMount } from "svelte";

  let nombre = "";
  let apellido = "";
  let dni = "";
  let telefono = "";
  let profesores = [];
  let errores = "";
  let seleccionadoId = null;

  async function agregarProfesor() {
    const res = await fetch("/api/profesores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, apellido, dni, telefono }),
    });
    const data = await res.json();

    if (data.error) {
      errores = data.error;
      return;
    }
    profesores = data.profesores ?? profesores;
    errores = "";
  }

  async function obtenerProfesores() {
    const res = await fetch("/api/profesores");
    profesores = await res.json();
  }

  function seleccionarProfesor(p) {
    nombre = p.nombre;
    apellido = p.apellido;
    dni = p.dni;
    telefono = p.telefono;
    seleccionadoId = p.id;
    errores = "";
  }

  async function modificarProfesor() {
    if (!seleccionadoId) {
      errores = "Primero seleccioná un profesor desde la lista (botón Cargar).";
      return;
    }

    const res = await fetch(`/api/profesores`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: seleccionadoId,
        nombre,
        apellido,
        dni,
        telefono,
      }),
    });
    const data = await res.json();

    if (data.error) {
      errores = data.error;
      return;
    }

    errores = "";
    profesores = data.profesores ?? profesores;
  }

  async function eliminarProfesor() {
    if (!seleccionadoId) {
      errores = "Primero seleccioná un profesor desde la lista (botón Cargar).";
      return;
    }

    const res = await fetch(`/api/profesores`, {
      method: "DELETE",
      body: JSON.stringify({ id: seleccionadoId }),
    });
    const data = await res.json();

    if (data.error) {
      errores = data.error;
      return;
    }

    errores = "";
    profesores = data.profesores ?? profesores;
  }

  onMount(obtenerProfesores);
</script>

<h2>Ingrese Profesor</h2>

<div class="form">
  <input bind:value={nombre} placeholder="Ingrese el nombre" />
  <input bind:value={apellido} placeholder="Ingrese el apellido" />
  <input bind:value={dni} placeholder="Ingrese el dni" />
  <input bind:value={telefono} placeholder="Ingrese el telefono" />

  <div class="acciones-form">
    <button on:click={agregarProfesor}>Agregar</button>
    <button on:click={modificarProfesor} disabled={!seleccionadoId}
      >Modificar</button
    >
    <button on:click={eliminarProfesor} disabled={!seleccionadoId}
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
  <div class="col">Apellido</div>
  <div class="col">DNI</div>
  <div class="col">Telefono</div>
  <div class="col">Creacion</div>
  <div class="col">Acción</div>
</div>

{#each profesores as profesor (profesor.id)}
  <div
    class="row align-items-body"
    class:selected={profesor.id === seleccionadoId}
  >
    <div class="col">{profesor.id}</div>
    <div class="col">{profesor.nombre}</div>
    <div class="col">{profesor.apellido}</div>
    <div class="col">{profesor.dni}</div>
    <div class="col">{profesor.telefono}</div>
    <div class="col">{profesor.fecha_creacion}</div>
    <div class="col">
      <button on:click={() => seleccionarProfesor(profesor)}>Cargar</button>
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
