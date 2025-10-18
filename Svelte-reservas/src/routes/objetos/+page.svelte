<script>
  import { onMount } from "svelte";

  let nombre = "";
  let descripcion = "";
  let categoria = "";
  let disponible = "";
  let objetos = [];
  let errores = "";
  let seleccionadoId = null;

  async function agregarObjeto() {
    const res = await fetch("/api/objetos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, descripcion, categoria, disponible }),
    });
    const data = await res.json();

    if (data.error) {
      errores = data.error;
      return;
    }
    objetos = data.objetos ?? objetos;
    errores = "";
  }

  async function obtenerObjeto() {
    const res = await fetch("/api/objetos");
    objetos = await res.json();
  }

  function seleccionarObjeto(o) {
    nombre = o.nombre;
    descripcion = o.descripcion;
    categoria = o.categoria;
    disponible = o.disponible;
    seleccionadoId = o.id;
    errores = "";
  }

  async function modificarObjeto() {
    if (!seleccionadoId) {
      errores = "Primero seleccioná un objeto desde la lista (botón Cargar).";
      return;
    }

    const res = await fetch(`/api/objetos`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: seleccionadoId,
        nombre,
        descripcion,
        categoria,
        disponible,
      }),
    });
    const data = await res.json();

    if (data.error) {
      errores = data.error;
      return;
    }

    errores = "";
    objetos = data.objetos ?? objetos;
  }

  async function eliminarObjeto() {
    if (!seleccionadoId) {
      errores = "Primero seleccioná un objeto desde la lista (botón Cargar).";
      return;
    }

    const res = await fetch(`/api/objetos`, {
      method: "DELETE",
      body: JSON.stringify({ id: seleccionadoId }),
    });
    const data = await res.json();

    if (data.error) {
      errores = data.error;
      return;
    }

    errores = "";
    objetos = data.objetos ?? objetos;
  }

  onMount(obtenerObjeto);
</script>

<h2>Ingrese objetos</h2>

<div class="form">
  <input bind:value={nombre} placeholder="Ingrese el nombre" />
  <input bind:value={descripcion} placeholder="Ingrese el descripcion" />
  <input bind:value={categoria} placeholder="Ingrese el categoria" />

  <div class="acciones-form">
    <button on:click={agregarObjeto}>Agregar</button>
    <button on:click={modificarObjeto} disabled={!seleccionadoId}
      >Modificar</button
    >
    <button on:click={eliminarObjeto} disabled={!seleccionadoId}
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
  <div class="col">Descripcion</div>
  <div class="col">Categoria</div>
  <div class="col">Disponible</div>
  <div class="col">Creacion</div>
  <div class="col">Acción</div>
</div>

{#each objetos as objeto (objeto.id)}
  <div
    class="row align-items-body"
    class:selected={objeto.id === seleccionadoId}
  >
    <div class="col">{objeto.id}</div>
    <div class="col">{objeto.nombre}</div>
    <div class="col">{objeto.descripcion}</div>
    <div class="col">{objeto.categoria}</div>
    <div class="col">
    {#if objeto.disponible===0}
      No
    {:else}
      Si
    {/if}
    </div>
    <div class="col">{objeto.fecha_creacion}</div>
    <div class="col">
      <button on:click={() => seleccionarObjeto(objeto)}>Cargar</button>
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