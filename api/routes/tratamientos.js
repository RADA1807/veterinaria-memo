const express = require('express');
const router = express.Router();
const db = require('../models/db');

// 📋 Obtener todos los tratamientos
router.get('/', async (req, res) => {
  try {
    if (req.user.rol === 'admin' || req.user.rol === 'veterinario') {
      const [rows] = await db.query(`
        SELECT t.id, t.tipo, t.descripcion, t.costo, t.fecha, t.veterinario,
               m.nombre AS mascota_nombre, m.especie,
               p.nombre AS propietario_nombre
        FROM tratamientos t
        INNER JOIN mascotas m ON t.paciente_id = m.id
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
        SELECT t.id, t.tipo, t.descripcion, t.costo, t.fecha, t.veterinario,
               m.nombre AS mascota_nombre
        FROM tratamientos t
        INNER JOIN mascotas m ON t.paciente_id = m.id
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
      SELECT id, tipo, descripcion, costo, fecha, veterinario
      FROM tratamientos
      WHERE paciente_id = ?
      ORDER BY fecha DESC
    `, [mascotaId]);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener tratamientos:', err);
    res.status(500).json({ error: 'Error al obtener tratamientos' });
  }
});

// ➕ Registrar tratamiento (solo admin o veterinario)
router.post('/', async (req, res) => {
  try {
    if (req.user.rol !== 'admin' && req.user.rol !== 'veterinario') {
      return res.status(403).json({ error: 'Sin permisos para registrar tratamientos' });
    }

    const { paciente_id, tipo, descripcion, fecha, costo, veterinario } = req.body;

    if (!paciente_id || !tipo || !fecha) {
      return res.status(400).json({ error: 'Paciente, tipo y fecha son obligatorios' });
    }

    await db.query(
      `INSERT INTO tratamientos (paciente_id, tipo, descripcion, fecha, costo, veterinario, fecha_creacion, fecha_actualizacion)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [paciente_id, tipo, descripcion || '', fecha, costo || 0, veterinario || '']
    );

    res.status(201).json({ message: '✅ Tratamiento registrado correctamente' });
  } catch (err) {
    console.error('❌ Error al registrar tratamiento:', err);
    res.status(500).json({ error: 'Error al registrar tratamiento' });
  }
});

// ✏️ Actualizar tratamiento (solo admin o veterinario)
router.put('/:id', async (req, res) => {
  try {
    if (req.user.rol !== 'admin' && req.user.rol !== 'veterinario') {
      return res.status(403).json({ error: 'Sin permisos para actualizar tratamientos' });
    }

    const { id } = req.params;
    const { tipo, descripcion, fecha, costo, veterinario } = req.body;

    const [result] = await db.query(
      `UPDATE tratamientos SET tipo=?, descripcion=?, fecha=?, costo=?, veterinario=?, fecha_actualizacion=NOW()
       WHERE id=?`,
      [tipo, descripcion || '', fecha, costo || 0, veterinario || '', id]
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
    const [result] = await db.query('DELETE FROM tratamientos WHERE id = ?', [id]);

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