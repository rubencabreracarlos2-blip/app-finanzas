const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PUERTO = process.env.PORT || 3000;
const CONTRASEÑA_ADMIN = "12345"; // ← CAMBIA ESTA CONTRASEÑA

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Base de datos
const DB_PATH = path.join(__dirname, 'db.json');
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({
    ingresos: [], gastos: [], servicios: [], tarjetas: [],
    gastosLargo: [], clientes: []
  }, null, 2));
}

// Rutas
app.get('/api/datos', (req, res) => {
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  res.json(db);
});

app.post('/api/guardar', (req, res) => {
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  const { tipo, registro } = req.body;
  if (!db[tipo]) return res.status(400).json({error: 'Tipo inválido'});
  db[tipo].push({id: Date.now(), ...registro});
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  res.json({ok: true});
});

app.post('/api/borrar', (req, res) => {
  const { tipo, id, claveAdmin } = req.body;
  if (claveAdmin !== CONTRASEÑA_ADMIN) return res.status(403).json({error: 'Sin permiso'});
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  db[tipo] = db[tipo].filter(item => item.id !== id);
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  res.json({ok: true});
});

app.post('/api/verificar-admin', (req, res) => {
  res.json({esAdmin: req.body.clave === CONTRASEÑA_ADMIN});
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PUERTO, () => {
  console.log(`✅ Servidor listo en el puerto ${PUERTO}`);
});