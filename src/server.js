import express from "express";
import cors from "cors";
import { StatusCodes } from 'http-status-codes';
import pkg from 'pg';
import config from './configs/db-config.js';

const { Client } = pkg;

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const client = new Client(config);

// Validaciones
const validateAlumno = (alumno, isUpdate = false) => {
  const errors = [];
  
  if (isUpdate && !alumno.id) {
    errors.push('El ID es requerido para actualización');
  }
  
  if (!alumno.nombre || alumno.nombre.length < 3) {
    errors.push('El nombre debe tener al menos 3 caracteres');
  }
  
  if (!alumno.apellido || alumno.apellido.length < 3) {
    errors.push('El apellido debe tener al menos 3 caracteres');
  }
  
  if (!alumno.id_curso || isNaN(alumno.id_curso)) {
    errors.push('El ID del curso debe ser un número válido');
  }
  
  if (!alumno.fecha_nacimiento || !Date.parse(alumno.fecha_nacimiento)) {
    errors.push('La fecha de nacimiento debe ser válida');
  }
  
  if (alumno.hace_deportes === undefined || (alumno.hace_deportes !== 0 && alumno.hace_deportes !== 1)) {
    errors.push('El campo hace_deportes debe ser 0 o 1');
  }
  
  return errors;
};

// Endpoints
app.get('/api/alumnos', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM alumnos');
    res.status(StatusCodes.OK).json(result.rows);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
});

app.get('/api/alumnos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'El ID debe ser un número' });
    }
    
    const result = await client.query('SELECT * FROM alumnos WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Alumno no encontrado' });
    }
    
    res.status(StatusCodes.OK).json(result.rows[0]);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
});

app.post('/api/alumnos', async (req, res) => {
  try {
    const alumno = req.body;
    const errors = validateAlumno(alumno);
    
    if (errors.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ errors });
    }
    
    const query = `
      INSERT INTO alumnos (nombre, apellido, id_curso, fecha_nacimiento, hace_deportes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      alumno.nombre,
      alumno.apellido,
      alumno.id_curso,
      alumno.fecha_nacimiento,
      alumno.hace_deportes
    ];
    
    const result = await client.query(query, values);
    res.status(StatusCodes.CREATED).json(result.rows[0]);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
});

app.put('/api/alumnos', async (req, res) => {
  try {
    const alumno = req.body;
    const errors = validateAlumno(alumno, true);
    
    if (errors.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ errors });
    }
    
    const checkResult = await client.query('SELECT * FROM alumnos WHERE id = $1', [alumno.id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Alumno no encontrado' });
    }
    
    const query = `
      UPDATE alumnos
      SET nombre = $1, apellido = $2, id_curso = $3, fecha_nacimiento = $4, hace_deportes = $5
      WHERE id = $6
      RETURNING *
    `;
    
    const values = [
      alumno.nombre,
      alumno.apellido,
      alumno.id_curso,
      alumno.fecha_nacimiento,
      alumno.hace_deportes,
      alumno.id
    ];
    
    const result = await client.query(query, values);
    res.status(StatusCodes.OK).json(result.rows[0]);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
});

app.delete('/api/alumnos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'El ID debe ser un número' });
    }
    
    const checkResult = await client.query('SELECT * FROM alumnos WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Alumno no encontrado' });
    }
    
    await client.query('DELETE FROM alumnos WHERE id = $1', [id]);
    res.status(StatusCodes.OK).json({ message: 'Alumno eliminado correctamente' });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});