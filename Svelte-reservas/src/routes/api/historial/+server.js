import db from "$lib/db.js";

export async function GET({ url }) {
  const fecha_desde = url.searchParams.get("fechaDesde");
  const fecha_hasta = url.searchParams.get("fechaHasta");
  const id_profesor = url.searchParams.get("idProfesor");

  let objetos;
  console.log("historial",id_profesor);
  let query = `SELECT r.id,r.fecha_creacion,
    concat(p.nombre, ', ', p.apellido) as profesor,
    o.nombre as objeto, ro.fecha_devolucion, o.disponible FROM RESERVAS r
    inner join reserva_objetos ro on r.id =ro.id_reserva 
    inner join profesores p on p.id = r.id_profesor
    inner join objetos o on o.id = ro.id_objeto
    where r.fecha_creacion between ? and ?`;

    console.log(fecha_desde, fecha_hasta,id_profesor);
  let params = [];
  params.push(fecha_desde);
  params.push(fecha_hasta);

  if(id_profesor){
    query+=` and r.id_profesor=?`;
    params.push(id_profesor);
    console.log("con profe")
  }

  const stmt = db.prepare(query);
  objetos = stmt.all(...params);

  console.log(objetos.length);

  return new Response(JSON.stringify(objetos), {
    headers: { "Content-Type": "application/json" },
  });
}
