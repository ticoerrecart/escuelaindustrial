// src/lib/db.js
import Database from 'better-sqlite3';

// This will create (or open) a SQLite database file
const db = new Database('reservas.db');

// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS profesores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    dni TEXT,
    telefono TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS materias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    anio INTEGER,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS objetos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    categoria TEXT,
    disponible boolean DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_profesor INTEGER, 
    id_materia INTEGER, 
    FOREIGN KEY(id_profesor) REFERENCES profesores(id),
    FOREIGN KEY(id_materia) REFERENCES materias(id)
  );

  CREATE TABLE IF NOT EXISTS reserva_objetos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_reserva INTEGER,
    id_objeto INTEGER,
    fecha_devolucion TIMESTAMP,
    FOREIGN KEY(id_reserva) REFERENCES reservas(id),
     FOREIGN KEY(id_objeto) REFERENCES objetos(id)
  );

  insert into profesores(id,nombre,apellido,dni,telefono) values (1,'tico','errecart','27328361','1234') on conflict do nothing;
  insert into profesores(id,nombre,apellido,dni,telefono) values (2,'Leo','Messi','45004998','44456677') on conflict do nothing;

  insert into materias(id,nombre,anio) values (1,'Proyecto, Disenio e Impl. de Sistemas',7)  on conflict do nothing;
  insert into materias(id,nombre,anio) values (2,'Fisica 1',1)  on conflict do nothing;
  insert into materias(id,nombre,anio) values (3,'Fisica 2',2)  on conflict do nothing;
  insert into materias(id,nombre,anio) values (4,'Matematica 1',1)  on conflict do nothing;
  insert into materias(id,nombre,anio) values (5,'Matematica 2',2)  on conflict do nothing;

  insert into objetos (id,nombre,descripcion,categoria) values (1,'Netbook 1',null,'netbook')  on conflict do nothing;
  insert into objetos (id,nombre,descripcion,categoria) values (2,'Netbook 2',null,'netbook')  on conflict do nothing;
  insert into objetos (id,nombre,descripcion,categoria) values (3,'Proyector 1',null,'proyector')  on conflict do nothing;
  insert into objetos (id,nombre,descripcion,categoria) values (4,'Proyector 2',null,'proyector')  on conflict do nothing;
  insert into objetos (id,nombre,descripcion,categoria) values (5,'Mouse 1',null,'periferico')  on conflict do nothing;
  insert into objetos (id,nombre,descripcion,categoria) values (6,'Mouse 2',null,'periferico')  on conflict do nothing;
  insert into objetos (id,nombre,descripcion,categoria) values (7,'Teclado 1',null,'periferico')  on conflict do nothing;
`);

export default db;
