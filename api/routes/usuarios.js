const express = require('express');
const router = express.Router();
const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const verifyToken = require('../middlewares/verifyToken');
const rateLimit = require('express-rate-limit');
const { enviarCodigoRecuperacion } = require('../utils/mailer');

// 🔒 Rate limiting para login y register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos, espera 15 minutos' }
});

// 📌 Registrar usuario + propietario
router.post('/register', authLimiter, async (req, res) => {
  const { nombre, apellido, cedula, email, telefono, password, direccion } = req.body;

  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ error: 'Nombre, apellido, email y password son obligatorios' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' });
  }

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
      'INSERT INTO usuarios (id, nombre, apellido, cedula, email, telefono, password, rol, fecha_creacion, fecha_actualizacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [usuarioId, nombre, apellido || null, cedula || null, email, telefono || null, hashedPassword, 'propietario']
    );

    const propietarioId = uuidv4();
    await db.query(
      'INSERT INTO propietarios (id, nombre, apellido, cedula, telefono, correo, direccion, usuario_id, fecha_creacion, fecha_actualizacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [propietarioId, nombre, apellido || null, cedula || null, telefono || null, email, direccion || null, usuarioId]
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
      apellido,
      email,
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

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
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const usuario = rows[0];
    const esValido = await bcrypt.compare(password, usuario.password);
    if (!esValido) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    let propietarioId = null;
    let mascotas = [];

    if (usuario.rol === 'propietario') {
      const [propRows] = await db.query(
        'SELECT id FROM propietarios WHERE usuario_id = ?',
        [usuario.id]
      );
      if (propRows.length === 0) {
        return res.status(404).json({ error: 'Propietario no encontrado' });
      }
      propietarioId = propRows[0].id;

      const [mascotasRows] = await db.query(
        'SELECT id, nombre, especie, raza FROM mascotas WHERE propietario_id = ?',
        [propietarioId]
      );
      mascotas = mascotasRows;
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '✅ Login exitoso',
      token,
      usuarioId: usuario.id,
      propietarioId,
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

// 🔑 Solicitar recuperación de contraseña
router.post('/recuperar-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'El correo es obligatorio' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, nombre FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No existe una cuenta con ese correo' });
    }

    const usuario = rows[0];
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiracion = new Date(Date.now() + 15 * 60 * 1000);

    await db.query(
      'UPDATE usuarios SET reset_codigo=?, reset_expiracion=? WHERE id=?',
      [codigo, expiracion, usuario.id]
    );

    const enviado = await enviarCodigoRecuperacion(email, codigo, usuario.nombre);

    if (!enviado) {
      return res.status(500).json({ error: 'Error al enviar el correo' });
    }

    res.json({ message: '✅ Código enviado a tu correo' });
  } catch (error) {
    console.error('❌ Error en recuperar-password:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🔑 Verificar código y cambiar contraseña
router.post('/reset-password', async (req, res) => {
  const { email, codigo, nuevaPassword } = req.body;

  if (!email || !codigo || !nuevaPassword) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (nuevaPassword.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, reset_codigo, reset_expiracion FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = rows[0];

    if (usuario.reset_codigo !== codigo) {
      return res.status(400).json({ error: 'Código incorrecto' });
    }

    if (new Date() > new Date(usuario.reset_expiracion)) {
      return res.status(400).json({ error: 'El código ha expirado' });
    }

    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    await db.query(
      'UPDATE usuarios SET password=?, reset_codigo=NULL, reset_expiracion=NULL WHERE id=?',
      [hashedPassword, usuario.id]
    );

    res.json({ message: '✅ Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('❌ Error en reset-password:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ✏️ Actualizar perfil
router.put('/update', verifyToken, async (req, res) => {
  const usuarioId = req.user.id;
  const { nombre, email, telefono, direccion } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({ error: 'Nombre y email son obligatorios' });
  }

  try {
    await db.query(
      'UPDATE usuarios SET nombre=?, email=?, telefono=?, fecha_actualizacion=NOW() WHERE id=?',
      [nombre, email, telefono, usuarioId]
    );

    await db.query(
      'UPDATE propietarios SET nombre=?, correo=?, telefono=?, direccion=?, fecha_actualizacion=NOW() WHERE usuario_id=?',
      [nombre, email, telefono, direccion || null, usuarioId]
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
    const fechaExpiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);

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