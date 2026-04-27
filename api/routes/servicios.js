const express = require('express');
const router = express.Router();
const db = require('../models/db');

// 📋 Obtener todos los servicios activos (público)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, descripcion, duracion_minutos, precio FROM servicios WHERE activo = true ORDER BY nombre ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener servicios:', err);
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
});

// ➕ Crear servicio (solo admin)
router.post('/', async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo el administrador puede crear servicios' });
    }

    const { nombre, descripcion, duracion_minutos, precio } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    await db.query(
      'INSERT INTO servicios (nombre, descripcion, duracion_minutos, precio) VALUES (?, ?, ?, ?)',
      [nombre, descripcion || '', duracion_minutos || 30, precio || 0]
    );

    res.status(201).json({ message: '✅ Servicio creado correctamente' });
  } catch (err) {
    console.error('❌ Error al crear servicio:', err);
    res.status(500).json({ error: 'Error al crear servicio' });
  }
});

// ✏️ Actualizar servicio (solo admin)
router.put('/:id', async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo el administrador puede actualizar servicios' });
    }

    const { id } = req.params;
    const { nombre, descripcion, duracion_minutos, precio, activo } = req.body;

    const [result] = await db.query(
      'UPDATE servicios SET nombre=?, descripcion=?, duracion_minutos=?, precio=?, activo=? WHERE id=?',
      [nombre, descripcion || '', duracion_minutos || 30, precio || 0, activo !== undefined ? activo : true, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json({ message: '✅ Servicio actualizado correctamente' });
  } catch (err) {
    console.error('❌ Error al actualizar servicio:', err);
    res.status(500).json({ error: 'Error al actualizar servicio' });
  }
});

// 🗑️ Eliminar servicio (solo admin)
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo el administrador puede eliminar servicios' });
    }

    const { id } = req.params;
    const [result] = await db.query('DELETE FROM servicios WHERE id=?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json({ message: '✅ Servicio eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar servicio:', err);
    res.status(500).json({ error: 'Error al eliminar servicio' });
  }
});

module.exports = router;