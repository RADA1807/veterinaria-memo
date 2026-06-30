const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const enviarCodigoRecuperacion = async (email, codigo, nombre) => {
  try {
    await transporter.sendMail({
      from: `"Veterinaria Memo" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Recuperación de contraseña - Veterinaria Memo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #00A99D;">Recuperación de contraseña</h2>
          <p>Hola ${nombre || ''},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código:</p>
          <div style="background: #E6F7F6; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #00A99D; letter-spacing: 4px;">${codigo}</span>
          </div>
          <p>Este código expira en 15 minutos.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <p style="color: #888; font-size: 12px; margin-top: 30px;">Veterinaria Memo</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    return false;
  }
};

module.exports = { enviarCodigoRecuperacion };