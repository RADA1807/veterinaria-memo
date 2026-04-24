const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');

// 📋 Obtener todos los tratamientos (admin) o por mascota (propietario)
router.get('/', async (req, res) => {
  try {
    if (req.user.rol === 'admin') {
      const [rows] = await db.query(`
        SELECT t.id, t.descripcion, t.fecha, t.costo,
               m.nombre AS mascota_nombre, m.especie,
               p.nombre AS propietario_nombre
        FROM tratamientos t
        INNER JOIN mascotas m ON t.mascota_id = m.id
        INNER JOIN propietarios p ON m.propietario_id = p.id
        ORDER BY t.fecha DESC
      `);
      return res.json(rows);
    } else {
      const [propRows] = await db.query(
        'SELECT id FROM propietarios WHERE usuario_id = ?',
        [req.user.id]
      );
      if (propRows.length === 0) {
        return res.status(404).json({ error: 'Propietario no encontrado' });
      }
      const propietarioId = propRows[0].id;

      const [rows] = await db.query(`
        SELECT t.id, t.descripcion, t.fecha, t.costo,
               m.nombre AS mascota_nombre
        FROM tratamientos t
        INNER JOIN mascotas m ON t.mascota_id = m.id
        WHERE m.propietario_id = ?
        ORDER BY t.fecha DESC
      `, [propietarioId]);

      return res.json(rows);
    }
  } catch (err) {
    console.error('❌ Error al obtener tratamientos:', err);
    res.status(500).json({ error: 'Error al obtener tratamientos' });
  }
});

// 🔍 Obtener tratamientos por mascota
router.get('/mascota/:mascotaId', async (req, res) => {
  try {
    const { mascotaId } = req.params;

    const [rows] = await db.query(`
      SELECT t.id, t.descripcion, t.fecha, t.costo
      FROM tratamientos t
      WHERE t.mascota_id = ?
      ORDER BY t.fecha DESC
    `, [mascotaId]);

    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener tratamientos:', err);
    res.status(500).json({ error: 'Error al obtener tratamientos' });
  }
});

// ➕ Registrar tratamiento (solo admin)
router.post('/', async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo el administrador puede registrar tratamientos' });
    }

    const { mascota_id, descripcion, fecha, costo } = req.body;

    if (!mascota_id || !descripcion || !fecha) {
      return res.status(400).json({ error: 'Mascota, descripción y fecha son obligatorios' });
    }

    const id = uuidv4();
    await db.query(
      `INSERT INTO tratamientos (id, mascota_id, descripcion, fecha, costo, fecha_creacion, fecha_actualizacion)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, mascota_id, descripcion, fecha, costo || 0]
    );

    res.status(201).json({
      message: '✅ Tratamiento registrado correctamente',
      tratamientoId: id,
    });
  } catch (err) {
    console.error('❌ Error al registrar tratamiento:', err);
    res.status(500).json({ error: 'Error al registrar tratamiento' });
  }
});

// ✏️ Actualizar tratamiento (solo admin)
router.put('/:id', async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo el administrador puede actualizar tratamientos' });
    }

    const { id } = req.params;
    const { descripcion, fecha, costo } = req.body;

    const [result] = await db.query(
      `UPDATE tratamientos SET descripcion=?, fecha=?, costo=?, fecha_actualizacion=NOW()
       WHERE id=?`,
      [descripcion, fecha, costo || 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tratamiento no encontrado' });
    }

    res.json({ message: '✅ Tratamiento actualizado correctamente' });
  } catch (err) {
    console.error('❌ Error al actualizar tratamiento:', err);
    res.status(500).json({ error: 'Error al actualizar tratamiento' });
  }
});

// 🗑️ Eliminar tratamiento (solo admin)
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo el administrador puede eliminar tratamientos' });
    }

    const { id } = req.params;
    const [result] = await db.query(
      'DELETE FROM tratamientos WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tratamiento no encontrado' });
    }

    res.json({ message: '✅ Tratamiento eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar tratamiento:', err);
    res.status(500).json({ error: 'Error al eliminar tratamiento' });
  }
});

module.exports = router;