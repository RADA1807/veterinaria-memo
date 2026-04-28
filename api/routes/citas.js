const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');

// Servicios disponibles de Veterinaria Memo
const SERVICIOS_DISPONIBLES = [
  'Consulta veterinaria',
  'Ultrasonido',
  'Rayos X',
  'Grooming',
  'Hemogramas',
  'Limpieza dental',
  'Nutrición animal',
  'Farmacia'
];

// 📅 Crear cita
router.post('/', async (req, res) => {
  try {
    const { mascota_id, fecha, hora, motivo, servicio } = req.body;
    const usuarioId = req.user.id;

    if (!mascota_id || !fecha || !hora || !motivo || !servicio) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (!SERVICIOS_DISPONIBLES.includes(servicio)) {
      return res.status(400).json({ error: 'Servicio no válido' });
    }

    // Validar que la fecha no sea domingo
    const diaSemana = new Date(fecha).getDay();
    if (diaSemana === 0) {
      return res.status(400).json({ error: 'No atendemos los domingos' });
    }

    // Validar hora (7:00 - 18:00)
    const [hh] = hora.split(':').map(Number);
    if (hh < 7 || hh >= 18) {
      return res.status(400).json({ error: 'Horario de atención: 7:00am a 6:00pm' });
    }

    const [propRows] = await db.query(
      'SELECT id FROM propietarios WHERE usuario_id = ?',
      [usuarioId]
    );
    if (propRows.length === 0) {
      return res.status(404).json({ error: 'Propietario no encontrado' });
    }
    const propietarioId = propRows[0].id;

    // Validar que la mascota pertenece al propietario
    const [mascotaRows] = await db.query(
      'SELECT id FROM mascotas WHERE id = ? AND propietario_id = ?',
      [mascota_id, propietarioId]
    );
    if (mascotaRows.length === 0) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    // Validar que no haya otra cita en esa fecha y hora
    const [citaExiste] = await db.query(
      'SELECT id FROM citas WHERE fecha = ? AND hora = ? AND estado != ?',
      [fecha, hora, 'cancelada']
    );
    if (citaExiste.length > 0) {
      return res.status(400).json({ error: 'Ya existe una cita en esa fecha y hora' });
    }

    const citaId = uuidv4();
    await db.query(
      `INSERT INTO citas (id, propietario_id, mascota_id, fecha, hora, motivo, servicio, estado, fecha_creacion, fecha_actualizacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente', NOW(), NOW())`,
      [citaId, propietarioId, mascota_id, fecha, hora, motivo, servicio]
    );

    res.status(201).json({
      message: '✅ Cita creada correctamente',
      citaId,
    });
  } catch (error) {
    console.error('❌ Error al crear cita:', error);
    res.status(500).json({ error: 'Error al crear la cita' });
  }
});

// 📋 Listar citas
router.get('/', async (req, res) => {
  try {
    if (req.user.rol === 'admin') {
      const [rows] = await db.query(`
        SELECT c.id, c.fecha, c.hora, c.motivo, c.servicio, c.estado,
               m.nombre AS mascota_nombre, m.especie,
               p.nombre AS propietario_nombre, p.correo AS propietario_email,
               p.telefono AS propietario_telefono
        FROM citas c
        INNER JOIN mascotas m ON c.mascota_id = m.id
        INNER JOIN propietarios p ON c.propietario_id = p.id
        ORDER BY c.fecha ASC, c.hora ASC
      `);
      return res.json(rows || []);
    } else {
      const [propRows] = await db.query(
        'SELECT id FROM propietarios WHERE usuario_id = ?',
        [req.user.id]
      );
      if (propRows.length === 0) {
        return res.json([]);
      }
      const propietarioId = propRows[0].id;

      const [rows] = await db.query(`
        SELECT c.id, c.fecha, c.hora, c.motivo, c.servicio, c.estado,
               m.nombre AS mascota_nombre, m.especie
        FROM citas c
        INNER JOIN mascotas m ON c.mascota_id = m.id
        WHERE c.propietario_id = ?
        ORDER BY c.fecha ASC, c.hora ASC
      `, [propietarioId]);

      return res.json(rows || []);
    }
  } catch (error) {
    console.error('❌ Error al listar citas:', error);
    res.status(500).json({ error: 'Error al obtener las citas' });
  }
});

// 🔍 Obtener una cita por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT c.*, m.nombre AS mascota_nombre, p.nombre AS propietario_nombre
      FROM citas c
      INNER JOIN mascotas m ON c.mascota_id = m.id
      INNER JOIN propietarios p ON c.propietario_id = p.id
      WHERE c.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Error al obtener cita:', error);
    res.status(500).json({ error: 'Error al obtener la cita' });
  }
});

// ✏️ Actualizar cita
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, hora, motivo, servicio } = req.body;

    const diaSemana = new Date(fecha).getDay();
    if (diaSemana === 0) {
      return res.status(400).json({ error: 'No atendemos los domingos' });
    }

    const [hh] = hora.split(':').map(Number);
    if (hh < 7 || hh >= 18) {
      return res.status(400).json({ error: 'Horario de atención: 7:00am a 6:00pm' });
    }

    const [propRows] = await db.query(
      'SELECT id FROM propietarios WHERE usuario_id = ?',
      [req.user.id]
    );
    if (propRows.length === 0) {
      return res.status(404).json({ error: 'Propietario no encontrado' });
    }
    const propietarioId = propRows[0].id;

    const [result] = await db.query(
      `UPDATE citas SET fecha=?, hora=?, motivo=?, servicio=?, fecha_actualizacion=NOW()
       WHERE id=? AND propietario_id=? AND estado='pendiente'`,
      [fecha, hora, motivo, servicio, id, propietarioId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cita no encontrada o ya no puede editarse' });
    }

    res.json({ message: '✅ Cita actualizada correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar cita:', error);
    res.status(500).json({ error: 'Error al actualizar la cita' });
  }
});

// 🔄 Actualizar estado (solo admin)
router.put('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo el administrador puede cambiar el estado' });
    }

    const estadosPermitidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    const [result] = await db.query(
      'UPDATE citas SET estado=?, fecha_actualizacion=NOW() WHERE id=?',
      [estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    res.json({ message: '✅ Estado actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error al actualizar el estado' });
  }
});

// 🗑️ Cancelar cita
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    const [propRows] = await db.query(
      'SELECT id FROM propietarios WHERE usuario_id = ?',
      [usuarioId]
    );
    if (propRows.length === 0) {
      return res.status(404).json({ error: 'Propietario no encontrado' });
    }
    const propietarioId = propRows[0].id;

    const [result] = await db.query(
      `UPDATE citas SET estado='cancelada', fecha_actualizacion=NOW()
       WHERE id=? AND propietario_id=?`,
      [id, propietarioId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    res.json({ message: '✅ Cita cancelada correctamente' });
  } catch (error) {
    console.error('❌ Error al cancelar cita:', error);
    res.status(500).json({ error: 'Error al cancelar la cita' });
  }
});

// 📊 Servicios disponibles
router.get('/servicios/lista', async (req, res) => {
  res.json(SERVICIOS_DISPONIBLES);
});

module.exports = router;