const express = require('express');
const router = express.Router();
const { cloudinary, upload } = require('../cloudinary');
const db = require('../models/db');

// 📸 Subir foto de mascota
router.post('/mascota/:id', upload.single('foto'), async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    }

    const fotoUrl = req.file.path;

    // Verificar que la mascota pertenece al propietario
    const [propRows] = await db.query(
      'SELECT id FROM propietarios WHERE usuario_id = ?',
      [usuarioId]
    );
    if (propRows.length === 0) {
      return res.status(404).json({ error: 'Propietario no encontrado' });
    }
    const propietarioId = propRows[0].id;

    const [result] = await db.query(
      'UPDATE mascotas SET foto = ?, fecha_actualizacion = NOW() WHERE id = ? AND propietario_id = ?',
      [fotoUrl, id, propietarioId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    res.json({
      message: '✅ Foto actualizada correctamente',
      foto: fotoUrl,
    });
  } catch (error) {
    console.error('❌ Error al subir foto:', error);
    res.status(500).json({ error: 'Error al subir la foto' });
  }
});

module.exports = router;