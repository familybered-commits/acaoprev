import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nome, oab, cidade, escritorio, email, whatsapp, area, disponibilidade, mensagem } = req.body;

    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_USER,
        pass: process.env.ZOHO_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.ZOHO_USER,
      to: 'contato@acaoprev.com',
      subject: 'Novo cadastro de parceiro — ' + (nome || 'sem nome'),
      html: `
        <h2>Novo Cadastro de Parceiro</h2>
        <p><strong>Nome:</strong> ${nome || '—'}</p>
        <p><strong>OAB:</strong> ${oab || '—'}</p>
        <p><strong>Cidade/UF:</strong> ${cidade || '—'}</p>
        <p><strong>Escritorio:</strong> ${escritorio || '—'}</p>
        <p><strong>E-mail:</strong> ${email || '—'}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp || '—'}</p>
        <p><strong>Area:</strong> ${area || '—'}</p>
        <p><strong>Disponibilidade:</strong> ${disponibilidade || '—'}</p>
        <p><strong>Mensagem:</strong> ${mensagem || '—'}</p>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Erro parceiros:', err);
    return res.status(500).json({ error: 'Falha ao enviar mensagem' });
  }
}
