const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Middlewares globales
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  credentials: true,
}));
app.use(express.json());

// Importar middlewares
const verifyToken = require('./middlewares/verifyToken');
const checkRole = require('./middlewares/checkRole');

// Importar rutas
const usuariosRoutes = require('./routes/usuarios');
const mascotasRoutes = require('./routes/mascotas');
const propietariosRoutes = require('./routes/propietarios');
const tratamientosRoutes = require('./routes/tratamientos');
const citasRoutes = require('./routes/citas');
const serviciosRoutes = require('./routes/servicios');

// Rutas públicas (sin token)
app.use('/api', usuariosRoutes);

// Rutas protegidas (requieren token)
app.use('/api/mascotas', verifyToken, mascotasRoutes);
app.use('/api/citas', verifyToken, citasRoutes);

// Rutas solo para admin
app.use('/api/propietarios', verifyToken, checkRole('admin'), propietariosRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/tratamientos', verifyToken, tratamientosRoutes);

// Ruta base
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ API Veterinaria Memo funcionando',
    version: '2.0.0',
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('❌ Error no controlado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;