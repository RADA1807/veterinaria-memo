const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');

// 🐾 Obtener todas las mascotas
router.get('/', async (req, res) => {
  try {
    if (req.user.rol === 'propietario') {
      const [propRows] = await db.query(
        'SELECT id FROM propietarios WHERE usuario_id = ?',
        [req.user.id]
      );
      if (propRows.length === 0) {
        return res.status(404).json({ error: 'Propietario no encontrado' });
      }
      const propietarioId = propRows[0].id;
      const [rows] = await db.query(
        'SELECT id, nombre, especie, raza, edad, historial_medico FROM mascotas WHERE propietario_id = ?',
        [propietarioId]
      );
      return res.json(rows);
    } else {
      // Admin ve todas las mascotas con nombre del propietario
      const [rows] = await db.query(`
        SELECT m.id, m.nombre, m.especie, m.raza, m.edad, m.historial_medico,
               p.nombre AS propietario_nombre, p.correo AS propietario_email
        FROM mascotas m
        INNER JOIN propietarios p ON m.propietario_id = p.id
        ORDER BY m.fecha_creacion DESC
      `);
      return res.json(rows);
    }
  } catch (err) {
    console.error('❌ Error al obtener mascotas:', err);
    res.status(500).json({ error: 'Error al obtener mascotas' });
  }
});

// 🔍 Obtener una mascota por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.rol === 'propietario') {
      const [propRows] = await db.query(
        'SELECT id FROM propietarios WHERE usuario_id = ?',
        [req.user.id]
      );
      if (propRows.length === 0) {
        return res.status(404).json({ error: 'Propietario no encontrado' });
      }
      const propietarioId = propRows[0].id;
      const [rows] = await db.query(
        'SELECT * FROM mascotas WHERE id = ? AND propietario_id = ?',
        [id, propietarioId]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Mascota no encontrada' });
      }
      return res.json(rows[0]);
    } else {
      const [rows] = await db.query(
        'SELECT * FROM mascotas WHERE id = ?',
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Mascota no encontrada' });
      }
      return res.json(rows[0]);
    }
  } catch (err) {
    console.error('❌ Error al obtener mascota:', err);
    res.status(500).json({ error: 'Error al obtener mascota' });
  }
});

// 🐶 Registrar mascota
router.post('/', async (req, res) => {
  const { nombre, especie, raza, edad, historial_medico } = req.body;

  if (!nombre || !especie || !raza || !edad) {
    return res.status(400).json({ error: 'Nombre, especie, raza y edad son obligatorios' });
  }

  try {
    let propietarioId = null;

    if (req.user.rol === 'propietario') {
      const [propRows] = await db.query(
        'SELECT id FROM propietarios WHERE usuario_id = ?',
        [req.user.id]
      );
      if (propRows.length === 0) {
        return res.status(404).json({ error: 'Propietario no encontrado' });
      }
      propietarioId = propRows[0].id;
    } else {
      propietarioId = req.body.propietario_id;
      if (!propietarioId) {
        return res.status(400).json({ error: 'propietario_id es obligatorio' });
      }
    }

    const id = uuidv4();
    await db.query(
      `INSERT INTO mascotas (id, nombre, especie, raza, edad, historial_medico, propietario_id, fecha_creacion, fecha_actualizacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, nombre, especie, raza, edad, historial_medico || '', propietarioId]
    );

    res.status(201).json({
      message: '✅ Mascota registrada exitosamente',
      mascotaId: id,
      nombre,
      especie,
      raza,
      edad,
    });
  } catch (err) {
    console.error('❌ Error al registrar mascota:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🩺 Actualizar mascota
router.put('/:id', async (req, res) => {
  const { nombre, especie, raza, edad, historial_medico } = req.body;
  const { id } = req.params;

  if (!nombre || !especie || !raza || !edad) {
    return res.status(400).json({ error: 'Nombre, especie, raza y edad son obligatorios' });
  }

  try {
    if (req.user.rol === 'propietario') {
      const [propRows] = await db.query(
        'SELECT id FROM propietarios WHERE usuario_id = ?',
        [req.user.id]
      );
      if (propRows.length === 0) {
        return res.status(404).json({ error: 'Propietario no encontrado' });
      }
      const propietarioId = propRows[0].id;

      const [result] = await db.query(
        `UPDATE mascotas SET nombre=?, especie=?, raza=?, edad=?, historial_medico=?, fecha_actualizacion=NOW()
         WHERE id=? AND propietario_id=?`,
        [nombre, especie, raza, edad, historial_medico || '', id, propietarioId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Mascota no encontrada' });
      }
    } else {
      const [result] = await db.query(
        `UPDATE mascotas SET nombre=?, especie=?, raza=?, edad=?, historial_medico=?, fecha_actualizacion=NOW()
         WHERE id=?`,
        [nombre, especie, raza, edad, historial_medico || '', id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Mascota no encontrada' });
      }
    }

    res.json({ message: '✅ Mascota actualizada correctamente' });
  } catch (err) {
    console.error('❌ Error al actualizar mascota:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🗑️ Eliminar mascota
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.rol === 'propietario') {
      const [propRows] = await db.query(
        'SELECT id FROM propietarios WHERE usuario_id = ?',
        [req.user.id]
      );
      if (propRows.length === 0) {
        return res.status(404).json({ error: 'Propietario no encontrado' });
      }
      const propietarioId = propRows[0].id;

      await db.query('DELETE FROM citas WHERE mascota_id = ?', [id]);
      const [result] = await db.query(
        'DELETE FROM mascotas WHERE id = ? AND propietario_id = ?',
        [id, propietarioId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Mascota no encontrada' });
      }
    } else {
      await db.query('DELETE FROM citas WHERE mascota_id = ?', [id]);
      const [result] = await db.query('DELETE FROM mascotas WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Mascota no encontrada' });
      }
    }

    res.json({ message: '✅ Mascota eliminada correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar mascota:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;