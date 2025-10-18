<script>
  import { onMount } from "svelte";

  let fecha_desde;
  let fecha_hasta;
  let historiales = [];
  let profesores = [];
  let nombreProfesor = "";
  // El ID se actualizará automáticamente cuando cambie nombreProfesor
  $: idProfesorSeleccionado =
    profesores.find((p) => `${p.nombre}, ${p.apellido}` === nombreProfesor)
      ?.id ?? null;

  async function realizarReserva() {
    console.log("obtener fechas");
    let url = `/api/historial?fechaDesde=${fecha_desde}&fechaHasta=${fecha_hasta}`;
    if (idProfesorSeleccionado) {
      url += `&idProfesor=${idProfesorSeleccionado}`;
    }
    const res = await fetch(url);

    const listado = await res.json();
    console.log(listado);
    if (listado) {
      historiales = [...listado];
    } else {
      alert("Error al recuperar los profesores");
    }
  }

  async function obtenerProfesores() {
    console.log("obtener profesores");
    const res = await fetch("/api/profesores");

    const listado = await res.json();
    console.log(listado);
    if (listado) {
      //actualizar la lista de objetos disponibles, nos tiene que venir de la respuesta
      profesores = listado;
      //editingId = null;
    } else {
      alert("Error al recuperar los profesores");
    }
  }

  onMount(() => {
    obtenerProfesores();
  });
</script>

<label>Fecha Desde:</label>
<input type="date" bind:value={fecha_desde} />

<br />
<br />

<label>Fecha Hasta:</label>
<input type="date" bind:value={fecha_hasta} />

<br />
<br />

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
    <option value="{profesor.nombre}, {profesor.apellido}"></option>
  {/each}
</datalist>

<input type="button" value="Seleccionar" on:click={realizarReserva} />

<div class="row align-items-header">
  <div class="col">ID</div>
  <div class="col">Creacion</div>
  <div class="col">Profesor</div>
  <div class="col">Objeto</div>
  <div class="col">Devolucion</div>
  <div class="col">Disponible</div>
</div>

{#each historiales as historial}
  <div class="row align-items-body">
    <div class="col">{historial.id}</div>
    <div class="col">{historial.fecha_creacion}</div>
    <div class="col">{historial.profesor}</div>
    <div class="col">{historial.objeto}</div>
    <div class="col">{historial.fecha_devolucion}</div>
    <div class="col">
      {#if historial.disponible === 0}
        No
      {:else}
        Si
      {/if}
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
