// src/lib/db.js
import Database from 'better-sqlite3';

// This will create (or open) a SQLite database file
const db = new Database('alumnos.db');

// CREATE TABLE IF NOT EXISTS if it doesn't exist
db.exec(`
 -- Profesores
CREATE TABLE IF NOT EXISTS profesor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
);

-- Materias
CREATE TABLE IF NOT EXISTS materia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    profesor_id INTEGER,
    FOREIGN KEY (profesor_id) REFERENCES profesor(id)
);

-- Alumnos
CREATE TABLE IF NOT EXISTS alumno (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_alumno_nombre ON alumno(nombre);

-- Asistencia de alumnos por clase
CREATE TABLE IF NOT EXISTS alumno_materia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alumno_id INTEGER,
    materia_id INTEGER,
    UNIQUE(alumno_id,materia_id),
    FOREIGN KEY (alumno_id) REFERENCES alumno(id)
    FOREIGN KEY (materia_id) REFERENCES clase(id)
);


-- Clases (cada día/hora de cursada)
CREATE TABLE IF NOT EXISTS clase (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    materia_id INTEGER,
    dias TEXT NOT NULL, -- JSON array de días de la semana, ej: '["lunes","miercoles"]'
    hora_inicio TIME,
    hora_fin TIME,
    FOREIGN KEY (materia_id) REFERENCES materia(id)
);

-- Asistencia de alumnos por clase
CREATE TABLE IF NOT EXISTS asistencia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    materia_id INTEGER,
    alumno_id INTEGER,
    estado TEXT CHECK(estado IN ('Presente','Ausente','Tarde','Se retira','Justificada')),
    fecha DATE NOT NULL,
    hora_ingreso TIME,
    hora_egreso TIME,
    UNIQUE(materia_id,alumno_id,fecha),
    FOREIGN KEY (alumno_id) REFERENCES alumno(id)
);

`);

export default db;
