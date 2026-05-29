const express = require('express');
const router = express.Router();
const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const verifyToken = require('../middlewares/verifyToken');
const rateLimit = require('express-rate-limit');

// 🔒 Rate limiting para login y register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: { error: 'Demasiados intentos, espera 15 minutos' }
});

// 📌 Registrar usuario + propietario
router.post('/register', authLimiter, async (req, res) => {
  const { nombre, email, telefono, password, direccion } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y password son obligatorios' });
  }
  
// 📌 Registrar administrador con código de invitación
router.post('/register-admin', async (req, res) => {
  const { nombre, email, telefono, password, codigo } = req.body;

  if (!nombre || !email || !password || !codigo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios incluyendo el código de invitación' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    // Validar código de invitación
    const [invitacion] = await db.query(
      'SELECT * FROM invitaciones WHERE codigo = ? AND usado = FALSE AND fecha_expiracion > NOW()',
      [codigo]
    );

    if (invitacion.length === 0) {
      return res.status(400).json({ error: 'Código de invitación inválido o expirado' });
    }

    const [existe] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existe.length > 0) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const usuarioId = uuidv4();

    await db.query(
      'INSERT INTO usuarios (id, nombre, email, telefono, password, rol, fecha_creacion, fecha_actualizacion) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [usuarioId, nombre, email, telefono || null, hashedPassword, 'admin']
    );

    // Marcar código como usado
    await db.query(
      'UPDATE invitaciones SET usado = TRUE WHERE codigo = ?',
      [codigo]
    );

    const token = jwt.sign(
      { id: usuarioId, rol: 'admin', email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '✅ Administrador registrado exitosamente',
      token,
      usuarioId,
      nombre,
      email,
      rol: 'admin',
    });
  } catch (error) {
    console.error('❌ Error en registro admin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' });
  }

  // Validar longitud de password
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const [existe] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existe.length > 0) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const usuarioId = uuidv4();

    await db.query(
      'INSERT INTO usuarios (id, nombre, email, telefono, password, rol, fecha_creacion, fecha_actualizacion) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [usuarioId, nombre, email, telefono || null, hashedPassword, 'propietario']
    );

    const propietarioId = uuidv4();
    await db.query(
      'INSERT INTO propietarios (id, nombre, telefono, correo, direccion, usuario_id, fecha_creacion, fecha_actualizacion) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
[propietarioId, nombre, telefono || null, email, direccion || null, usuarioId]
    );

    const token = jwt.sign(
      { id: usuarioId, rol: 'propietario', email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '✅ Registro exitoso',
      token,
      usuarioId,
      propietarioId,
      nombre,
      email,
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 📌 Login
router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son obligatorios' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, nombre, email, telefono, password, rol FROM usuarios WHERE email = ?',
      [email]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = rows[0];
    const esValido = await bcrypt.compare(password, usuario.password);
    if (!esValido) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    let propietarioId = null;

if (usuario.rol === 'propietario') {
  const [propRows] = await db.query(
    'SELECT id FROM propietarios WHERE usuario_id = ?',
    [usuario.id]
  );
  if (propRows.length === 0) {
    return res.status(404).json({ error: 'Propietario no encontrado' });
  }
  propietarioId = propRows[0].id;
}

let mascotas = [];
if (usuario.rol === 'propietario') {
  const [mascotasRows] = await db.query(
    'SELECT id, nombre, especie, raza FROM mascotas WHERE propietario_id = ?',
    [propietarioId]
  );
  mascotas = mascotasRows;
}
    const propietario = propRows[0];

    const [mascotas] = await db.query(
      'SELECT id, nombre, especie, raza FROM mascotas WHERE propietario_id = ?',
      [propietario.id]
    );

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

  res.json({
  message: '✅ Login exitoso',
  token,
  usuarioId: usuario.id,
  propietarioId: propietarioId,
  nombre: usuario.nombre,
  email: usuario.email,
  telefono: usuario.telefono,
  rol: usuario.rol,
  mascotas,
});
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ✏️ Actualizar perfil
router.put('/update', verifyToken, async (req, res) => {
  const usuarioId = req.user.id;
  const { nombre, email, telefono } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({ error: 'Nombre y email son obligatorios' });
  }

  try {
    await db.query(
      'UPDATE usuarios SET nombre=?, email=?, telefono=?, fecha_actualizacion=NOW() WHERE id=?',
      [nombre, email, telefono, usuarioId]
    );

    await db.query(
      'UPDATE propietarios SET nombre=?, correo=?, telefono=?, fecha_actualizacion=NOW() WHERE usuario_id=?',
      [nombre, email, telefono, usuarioId]
    );

    res.json({ message: '✅ Perfil actualizado correctamente', nombre, email, telefono });
  } catch (err) {
    console.error('❌ Error en update:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🗑️ Eliminar cuenta
router.delete('/delete', verifyToken, async (req, res) => {
  const usuarioId = req.user.id;

  try {
    const [propRows] = await db.query(
      'SELECT id FROM propietarios WHERE usuario_id = ?',
      [usuarioId]
    );

    if (propRows.length > 0) {
      const propietarioId = propRows[0].id;
      await db.query('DELETE FROM citas WHERE propietario_id = ?', [propietarioId]);
      await db.query('DELETE FROM mascotas WHERE propietario_id = ?', [propietarioId]);
      await db.query('DELETE FROM propietarios WHERE id = ?', [propietarioId]);
    }

    await db.query('DELETE FROM usuarios WHERE id = ?', [usuarioId]);

    res.json({ message: '✅ Cuenta eliminada correctamente' });
  } catch (err) {
    console.error('❌ Error en delete:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🚪 Logout
router.post('/logout', verifyToken, (req, res) => {
  res.json({ message: '✅ Sesión cerrada correctamente' });
});

// 🎟️ Generar código de invitación (solo admin)
router.post('/generar-invitacion', verifyToken, async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo el administrador puede generar invitaciones' });
    }

    const codigo = 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const id = uuidv4();
    const fechaExpiracion = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await db.query(
      'INSERT INTO invitaciones (id, codigo, usado, fecha_expiracion, creado_por) VALUES (?, ?, FALSE, ?, ?)',
      [id, codigo, fechaExpiracion, req.user.id]
    );

    res.json({ message: '✅ Invitación generada', codigo, expira: fechaExpiracion });
  } catch (error) {
    console.error('❌ Error al generar invitación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ✅ Validar código de invitación
router.post('/validar-invitacion', async (req, res) => {
  try {
    const { codigo } = req.body;
    if (!codigo) return res.status(400).json({ error: 'Código requerido' });

    const [rows] = await db.query(
      'SELECT * FROM invitaciones WHERE codigo = ? AND usado = FALSE AND fecha_expiracion > NOW()',
      [codigo]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Código inválido o expirado' });
    }

    res.json({ valido: true });
  } catch (error) {
    console.error('❌ Error al validar invitación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;