import express from "express"; // hacer npm i express
import cors from "cors";       // hacer npm i cors
import config from './configs/db-config.js';
import pkg from 'pg';

const { Client } = pkg;

const app = express();
const port = 3000;

// Agrego los Middlewares
app.use(cors());         // Middleware de CORS
app.use(express.json()); // Middleware para parsear y comprender JSON

// Acá abajo poner todos los EndPoints
app.get('/api/alumnos/', async (req, res) => {
    // Lógica aquí
    res.send("GET todos los alumnos");
});

app.get('/api/alumnos/:id', async (req, res) => {
    // Lógica aquí
    const { id } = req.params;
    res.send(`GET alumno con ID ${id}`);
});

app.post('/api/alumnos/', async (req, res) => {
    // Lógica aquí
    const alumno = req.body;
    res.send(`POST nuevo alumno: ${JSON.stringify(alumno)}`);
});

app.put('/api/alumnos/', async (req, res) => {
    // Lógica aquí
    const alumno = req.body;
    res.send(`PUT actualizar alumno: ${JSON.stringify(alumno)}`);
});

app.delete('/api/alumnos/:id', async (req, res) => {
    // Lógica aquí
    const { id } = req.params;
    res.send(`DELETE alumno con ID ${id}`);
});

// Inicio el Server y lo pongo a escuchar.
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
