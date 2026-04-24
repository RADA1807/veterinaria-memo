const express = require('express');
const router = express.Router();
const db = require('../models/db');

// 📋 Obtener todos los propietarios (solo admin)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.id, p.nombre, p.correo, p.telefono,
             COUNT(m.id) AS total_mascotas
      FROM propietarios p
      LEFT JOIN mascotas m ON m.propietario_id = p.id
      GROUP BY p.id
      ORDER BY p.nombre ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener propietarios:', err);
    res.status(500).json({ error: 'Error al obtener propietarios' });
  }
});

// 🔍 Obtener un propietario con sus mascotas y citas
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [propRows] = await db.query(
      'SELECT id, nombre, correo, telefono FROM propietarios WHERE id = ?',
      [id]
    );
    if (propRows.length === 0) {
      return res.status(404).json({ error: 'Propietario no encontrado' });
    }

    const [mascotas] = await db.query(
      'SELECT id, nombre, especie, raza, edad FROM mascotas WHERE propietario_id = ?',
      [id]
    );

    const [citas] = await db.query(`
      SELECT c.id, c.fecha, c.hora, c.motivo, c.servicio, c.estado,
             m.nombre AS mascota_nombre
      FROM citas c
      INNER JOIN mascotas m ON c.mascota_id = m.id
      WHERE c.propietario_id = ?
      ORDER BY c.fecha DESC
    `, [id]);

    res.json({
      ...propRows[0],
      mascotas,
      citas,
    });
  } catch (err) {
    console.error('❌ Error al obtener propietario:', err);
    res.status(500).json({ error: 'Error al obtener propietario' });
  }
});

// 🗑️ Eliminar propietario (solo admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM citas WHERE propietario_id = ?', [id]);
    await db.query('DELETE FROM mascotas WHERE propietario_id = ?', [id]);
    await db.query('DELETE FROM usuarios WHERE id = (SELECT usuario_id FROM propietarios WHERE id = ?)', [id]);
    await db.query('DELETE FROM propietarios WHERE id = ?', [id]);

    res.json({ message: '✅ Propietario eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar propietario:', err);
    res.status(500).json({ error: 'Error al eliminar propietario' });
  }
});

module.exports = router;